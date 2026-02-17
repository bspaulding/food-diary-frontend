import auth0
import gleam/float
import queries

import formal/form.{type Form}
import gleam/dict.{type Dict}
import gleam/dynamic.{type Dynamic}
import gleam/dynamic/decode
import gleam/http.{Get, Post}
import gleam/http/request
import gleam/int
import gleam/io
import gleam/json
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/result
import gleam/string
import gleam/uri.{type Uri}
import gtz
import lustre
import lustre/attribute
import lustre/effect.{type Effect}
import lustre/element.{type Element}
import lustre/element/html
import lustre/event
import modem
import rsvp
import tempo
import tempo/date
import tempo/datetime

pub fn main() -> Nil {
  let app = lustre.application(init, update, view)
  let assert Ok(_) = lustre.start(app, "#app", Nil)

  Nil
}

pub type AuthInfo {
  AuthInfo(access_token: String, user: Option(User))
}

pub type Model {
  NotFound
  AuthCallback
  LoggedOut
  DiaryList(
    auth: AuthInfo,
    is_loading: Bool,
    error: Option(String),
    diary_entries: Dict(Int, queries.DiaryEntry),
    diary_list_offset: Int,
  )
  DiaryEntryEdit(
    auth: AuthInfo,
    entry_id: String,
    entry: Option(queries.DiaryEntry),
    form: Form(DiaryEntryEditFormData),
  )
  DiaryEntryNew(auth: AuthInfo)
}

pub type User {
  User(
    id: String,
    name: String,
    email: String,
    picture: String,
    profile: Option(String),
  )
}

fn init(_args) -> #(Model, Effect(Msg)) {
  let assert Ok(uri) = modem.initial_uri()
  init_from_uri(uri)
}

fn init_from_uri(uri: uri.Uri) {
  let token = decode.run(js_get_stored_token(), decode.optional(decode.string))

  let auth: Option(AuthInfo) = case token {
    Ok(Some(token)) -> {
      Some(AuthInfo(token, None))
    }
    _ -> None
  }
  let #(model, eff) = uri_to_route(auth, uri)

  #(
    model,
    effect.batch([
      modem.init(BrowserChangedRoute),
      case auth {
        Some(AuthInfo(token, _)) -> load_user_info(token)
        _ -> effect.none()
      },
      eff,
    ]),
  )
}

fn uri_to_route(auth: Option(AuthInfo), uri: Uri) -> #(Model, Effect(Msg)) {
  let segments = uri.path_segments(uri.path)
  case auth, segments {
    Some(auth), ["diary_entry", id, "edit"] -> #(
      DiaryEntryEdit(auth, id, None, diary_entry_edit_form(id)),
      load_diary_entry(auth.access_token, id),
    )
    Some(auth), ["diary_entry", "new"] -> #(DiaryEntryNew(auth), effect.none())
    Some(auth), [] -> #(
      DiaryList(
        auth,
        diary_entries: dict.new(),
        diary_list_offset: 0,
        is_loading: False,
        error: None,
      ),
      load_diary_entries(auth.access_token, 0),
    )
    _, ["auth", "callback"] -> #(AuthCallback, handle_auth_callback())
    None, [] -> #(LoggedOut, effect.none())
    _, _ -> #(NotFound, effect.none())
  }
}

type Msg {
  // auth
  Login
  Logout
  HandleAuthCallback(String)
  AuthGotToken(Result(String, rsvp.Error))
  ReceivedUserInfo(Result(User, rsvp.Error))

  // app
  UserDeletedEntry(queries.DiaryEntry)
  UserLoadedMoreEntries
  UserSubmittedDiaryEntryEditForm(
    result: Result(DiaryEntryEditFormData, Form(DiaryEntryEditFormData)),
  )

  // gql
  ApiLoadedDiaryEntries(Result(queries.DiaryEntriesResponse, rsvp.Error))
  ApiLoadedDiaryEntry(Result(queries.DiaryEntryResponse, rsvp.Error))

  // routing
  BrowserChangedRoute(Uri)
}

// ------
// JS FFI
// ------

@external(javascript, "./app.ffi.mjs", "redirectToLogin")
fn js_redirect_to_login(_auth_url: String) -> Nil

@external(javascript, "./app.ffi.mjs", "getStoredToken")
fn js_get_stored_token() -> Dynamic

@external(javascript, "./app.ffi.mjs", "storeToken")
fn js_store_token(_token: String) -> Nil

@external(javascript, "./app.ffi.mjs", "getAuthCodeFromUrl")
fn js_get_auth_code() -> Dynamic

@external(javascript, "./app.ffi.mjs", "clearStoredToken")
fn js_clear_stored_token() -> Nil

@external(javascript, "./app.ffi.mjs", "resetLocation")
fn js_reset_location() -> Nil

// @external(javascript, "./app.ffi.mjs", "exchangeCodeForToken")
// fn js_exchange_code_for_token(
//   _domain: String,
//   _client_id: String,
//   _code: String,
//   _redirect_uri: String,
// ) -> Dynamic

// ------------
// Auth0 stuffs
// ------------

fn handle_auth_callback() -> Effect(Msg) {
  let code = decode.run(js_get_auth_code(), decode.optional(decode.string))
  case code {
    Ok(Some(code)) -> {
      io.println("code was some")
      use dispatch <- effect.from
      dispatch(HandleAuthCallback(code))
    }
    _ -> {
      io.println("code was none")
      effect.none()
    }
  }
}

fn perform_login() -> Effect(Msg) {
  // Build the Auth0 authorization URL
  let auth_url =
    "https://"
    <> auth0.auth0_domain
    <> "/authorize"
    <> "?response_type=code"
    <> "&client_id="
    <> auth0.auth0_client_id
    <> "&redirect_uri="
    <> auth0.auth0_redirect_uri()
    <> "&scope=openid profile email"
    <> "&audience="
    <> auth0.auth0_audience

  js_redirect_to_login(auth_url)

  // unreachable
  effect.none()
}

fn exchange_code_for_token(code: String) -> Effect(Msg) {
  // Exchange authorization code for access token
  // This would make a POST request to Auth0's token endpoint
  let body =
    json.object([
      #("grant_type", json.string("authorization_code")),
      #("client_id", json.string(auth0.auth0_client_id)),
      #("code", json.string(code)),
      #("redirect_uri", json.string(auth0.auth0_redirect_uri())),
    ])
  let decoder = {
    use token <- decode.field("access_token", decode.string)
    decode.success(token)
  }
  let handler = rsvp.expect_json(decoder, AuthGotToken)

  rsvp.post("https://" <> auth0.auth0_domain <> "/oauth/token", body, handler)
}

fn clear_token() -> Effect(Msg) {
  // Clear token from localStorage
  js_clear_stored_token()
  effect.none()
}

fn load_user_info(token: String) -> Effect(Msg) {
  let request =
    request.new()
    |> request.set_method(Get)
    |> request.set_header("authorization", "Bearer " <> token)
    |> request.set_host(auth0.auth0_domain)
    |> request.set_path("/userinfo")
  let decode_user = {
    use sub <- decode.field("sub", decode.string)
    use name <- decode.field("name", decode.string)
    use email <- decode.field("email", decode.string)
    use picture <- decode.field("picture", decode.string)
    use profile <- decode.optional_field(
      "profile",
      None,
      decode.optional(decode.string),
    )
    decode.success(User(
      id: sub,
      name: name,
      email: email,
      picture: picture,
      profile: profile,
    ))
  }
  let handler = rsvp.expect_json(decode_user, ReceivedUserInfo)
  rsvp.send(request, handler)
}

fn run_graphql_query(token, query, decoder, msg) {
  let body =
    json.object([
      #("query", json.string(query)),
    ])
    |> json.to_string
  let request =
    request.new()
    |> request.set_method(Post)
    |> request.set_header("authorization", "Bearer " <> token)
    |> request.set_host("food-diary.motingo.com")
    |> request.set_path("/api/v1/graphql")
    |> request.set_header("content-type", "application/json")
    |> request.set_body(body)
  let handler = rsvp.expect_json(decoder, msg)
  rsvp.send(request, handler)
}

fn load_diary_entries(token: String, offset: Int) -> Effect(Msg) {
  run_graphql_query(
    token,
    queries.get_entries_query(offset),
    queries.diary_entries_response_decoder(),
    ApiLoadedDiaryEntries,
  )
}

fn load_diary_entry(token: String, entry_id: String) -> Effect(Msg) {
  run_graphql_query(
    token,
    queries.get_entry_query(entry_id),
    queries.diary_entry_response_decoder(),
    ApiLoadedDiaryEntry,
  )
}

fn update_diary_entry(token: String, form: DiaryEntryEditFormData) {
  run_graphql_query(
    token,
    queries.update_entry_query(form.entry_id, form.servings, form.consumed_at),
    queries.diary_entry_response_decoder(),
    ApiLoadedDiaryEntry,
  )
}

fn update(model: Model, msg: Msg) -> #(Model, Effect(Msg)) {
  case msg {
    BrowserChangedRoute(uri) -> init_from_uri(uri)

    Login -> {
      #(model, perform_login())
    }

    Logout -> {
      #(LoggedOut, clear_token())
    }

    HandleAuthCallback(code) -> {
      #(AuthCallback, exchange_code_for_token(code))
    }

    AuthGotToken(Error(error)) -> {
      echo error
      #(LoggedOut, effect.none())
    }

    AuthGotToken(Ok(access_token)) -> {
      #(AuthCallback, {
        js_store_token(access_token)
        modem.push("/", None, None)
      })
    }

    ReceivedUserInfo(Ok(user)) -> {
      #(
        case model {
          NotFound -> NotFound
          LoggedOut -> LoggedOut
          AuthCallback -> AuthCallback
          DiaryList(..) ->
            DiaryList(
              ..model,
              auth: AuthInfo(model.auth.access_token, Some(user)),
            )
          DiaryEntryNew(..) ->
            DiaryEntryNew(auth: AuthInfo(model.auth.access_token, Some(user)))
          DiaryEntryEdit(..) ->
            DiaryEntryEdit(
              ..model,
              auth: AuthInfo(model.auth.access_token, Some(user)),
            )
        },
        effect.none(),
      )
    }

    ReceivedUserInfo(Error(err)) -> {
      echo err
      #(model, clear_token())
    }

    // app
    UserDeletedEntry(_entry) -> {
      // TODO
      #(model, effect.none())
    }
    UserLoadedMoreEntries ->
      case model {
        DiaryList(..) -> #(
          DiaryList(..model, diary_list_offset: model.diary_list_offset + 50),
          load_diary_entries(
            model.auth.access_token,
            model.diary_list_offset + 50,
          ),
        )
        _ -> #(model, effect.none())
      }
    UserSubmittedDiaryEntryEditForm(Error(_form)) -> #(model, effect.none())
    UserSubmittedDiaryEntryEditForm(Ok(data)) ->
      case model {
        DiaryEntryEdit(..) -> #(
          model,
          update_diary_entry(model.auth.access_token, data),
        )
        _ -> #(model, effect.none())
      }

    // gql
    ApiLoadedDiaryEntries(Error(err)) -> {
      case model {
        DiaryList(..) -> #(
          DiaryList(..model, error: Some(rsvp_error_to_string(err))),
          effect.none(),
        )
        _ -> #(model, effect.none())
      }
    }
    ApiLoadedDiaryEntries(Ok(res)) -> {
      case model, res.data {
        DiaryList(..), Some(data) -> {
          let entries_by_id =
            list.fold(data.entries, model.diary_entries, fn(by_id, entry) {
              dict.insert(by_id, entry.id, entry)
            })
          #(DiaryList(..model, diary_entries: entries_by_id), effect.none())
        }
        _, _ -> #(model, effect.none())
      }
    }
    ApiLoadedDiaryEntry(Error(err)) -> {
      case model {
        DiaryList(..) -> #(
          DiaryList(..model, error: Some(rsvp_error_to_string(err))),
          effect.none(),
        )
        _ -> #(model, effect.none())
      }
    }
    ApiLoadedDiaryEntry(Ok(res)) -> {
      case model, res.data {
        DiaryList(..), Some(data) -> {
          #(
            DiaryList(
              ..model,
              diary_entries: dict.insert(
                model.diary_entries,
                data.entry.id,
                data.entry,
              ),
            ),
            effect.none(),
          )
        }
        DiaryEntryEdit(entry_id: entry_id, ..), Some(data) -> {
          case entry_id == int.to_string(data.entry.id) {
            True -> #(
              DiaryEntryEdit(..model, entry: Some(data.entry)),
              effect.none(),
            )
            False -> #(model, effect.none())
          }
        }
        _, _ -> #(model, effect.none())
      }
    }
  }
}

fn rsvp_error_to_string(error: rsvp.Error) -> String {
  case error {
    rsvp.BadBody -> "BadBody"
    rsvp.BadUrl(url) -> "BadUrl(" <> url <> ")"
    rsvp.NetworkError -> "NetworkError"
    rsvp.HttpError(res) ->
      "HTTP Error " <> int.to_string(res.status) <> ": " <> res.body
    rsvp.JsonError(_err) -> "JsonError"
    rsvp.UnhandledResponse(_res) -> "UnhandledResponse"
  }
}

fn layout(model: Model, children: Element(msg)) -> Element(msg) {
  html.div(
    [
      attribute.class(
        "font-sans text-slate-800 flex flex-col bg-slate-50 relative px-4 pt-20",
      ),
    ],
    [
      html.header(
        [
          attribute.class(
            "fixed top-0 left-0 right-0 h-16 flex px-4 justify-start items-center bg-slate-50",
          ),
        ],
        [
          html.h1([attribute.class("text-2xl font-bold")], [
            html.text("Food Diary"),
          ]),
          case model {
            DiaryList(auth: AuthInfo(user: Some(user), ..), ..) ->
              user_profile_badge(user)
            DiaryEntryNew(auth: AuthInfo(user: Some(user), ..)) ->
              user_profile_badge(user)
            DiaryEntryEdit(auth: AuthInfo(user: Some(user), ..), ..) ->
              user_profile_badge(user)
            _ -> html.text("")
          },
        ],
      ),
      children,
    ],
  )
}

fn user_profile_badge(user: User) {
  html.div([attribute.class("absolute right-2 w-12 h-12")], [
    html.a([attribute.href(option.unwrap(user.profile, or: ""))], [
      html.img([
        attribute.src(user.picture),
        attribute.class("border border-slate-800 rounded-full"),
      ]),
    ]),
  ])
}

fn view(model: Model) -> Element(Msg) {
  layout(
    model,
    html.div([], [
      case model {
        DiaryList(
          diary_entries: diary_entries,
          error: error,
          is_loading: is_loading,
          ..,
        ) -> diary_list_route(diary_entries, error, is_loading)
        DiaryEntryEdit(_auth, id, entry, form) ->
          diary_entry_edit_route(id, entry, form)
        DiaryEntryNew(..) -> diary_entry_new_route(model)
        LoggedOut -> logged_out_page()
        AuthCallback -> html.text("")
        NotFound -> html.text("Not Found")
      },
    ]),
  )
}

fn logged_out_page() {
  html.button([event.on_click(Login)], [html.text("Login")])
}

fn todo_view() {
  html.div([], [html.text("TODO")])
}

fn diary_entry_new_route(_model) {
  html.div([attribute.class("flex space-x-4 mb-4")], [
    button_link([attribute.href("/")], [
      html.text("Back to Diary"),
    ]),
    todo_view(),
  ])
}

fn diary_list_route(diary_entries, error, is_loading) {
  case is_loading, error {
    True, _ -> html.text("Loading...")
    False, Some(error) -> html.text(error)
    False, None ->
      element.fragment([
        html.div([attribute.class("flex space-x-4 mb-4")], [
          button_link([attribute.href("/diary_entry/new")], [
            html.text("Add New Entry"),
          ]),
          button_link([attribute.href("/nutrition_item/new")], [
            html.text("Add Item"),
          ]),
          button_link([attribute.href("/recipe/new")], [html.text("Add Recipe")]),
        ]),
        diary_entries_view(diary_entries),
        html.div([attribute.class("mb-4 flex justify-center")], [
          button([event.on_click(UserLoadedMoreEntries)], [
            html.text("Load More"),
          ]),
        ]),
      ])
  }
}

fn diary_entries_view(entries: Dict(Int, queries.DiaryEntry)) {
  let assert Ok(local_tz) = gtz.local_name() |> gtz.timezone
  let by_day =
    list.group(dict.values(entries), fn(e) {
      datetime.literal(e.consumed_at)
      |> datetime.to_timezone(local_tz)
      |> datetime.format(tempo.Custom("YYYY-MM-DD"))
    })
  html.ul(
    [attribute.class("mt-4")],
    list.map(
      dict.to_list(by_day)
        |> list.sort(fn(a, b) { string.compare(b.0, a.0) }),
      fn(pair) { diary_entries_day(pair.0, pair.1) },
    ),
  )
}

fn date_badge(attrs, date_str: String) {
  let #(day, month_name) =
    date.parse(date_str, tempo.ISO8601Date)
    |> result.map(fn(d) {
      let day = date.get_day(d)
      let month_name = date.format(d, tempo.CustomDate("MMM"))
      // "Feb"
      #(day, month_name)
    })
    |> result.unwrap(#(1, "Jan"))

  html.div(
    list.prepend(attrs, attribute.class("text-center text-xl font-semibold")),
    [
      html.p([attribute.class("text-4xl")], [html.text(int.to_string(day))]),
      html.p([attribute.class("uppercase")], [html.text(month_name)]),
    ],
  )
}

fn total_macro(
  entries: List(queries.DiaryEntry),
  get_macro: fn(queries.DiaryEntry) -> Float,
) -> Float {
  list.fold(entries, 0.0, fn(acc, e) { acc +. entry_total_macro(e, get_macro) })
}

fn entry_total_macro(
  entry: queries.DiaryEntry,
  get_macro: fn(queries.DiaryEntry) -> Float,
) -> Float {
  entry.servings *. get_macro(entry)
}

fn entry_macro(
  entry: queries.DiaryEntry,
  get_macro: fn(queries.NutritionItem) -> Float,
) -> Float {
  case entry.nutrition_item, entry.recipe {
    Some(item), None -> get_macro(item)
    None, Some(recipe) ->
      list.fold(recipe.recipe_items, 0.0, fn(acc, recipe_item) {
        acc +. recipe_item.servings *. get_macro(recipe_item.nutrition_item)
      })
    _, _ -> 0.0
  }
  |> fn(x) { entry.servings *. x }
}

fn entry_added_sugars(entry: queries.DiaryEntry) {
  entry_macro(entry, fn(i) { i.added_sugars_grams })
}

fn entry_protein_grams(entry: queries.DiaryEntry) {
  entry_macro(entry, fn(i) { i.protein_grams })
}

fn entry_fat_grams(entry: queries.DiaryEntry) {
  entry_macro(entry, fn(i) { i.total_fat_grams })
}

fn entry_macro_view(value: Float, unit: String, label: String) -> Element(msg) {
  html.div([attribute.class("text-center text-xl mt-4")], [
    html.p([], [
      html.text(
        int.to_string(float.truncate(float.ceiling(value))) <> " " <> unit,
      ),
    ]),
    html.p([attribute.class("text-sm uppercase")], [html.text(label)]),
  ])
}

fn diary_entries_day(day: String, entries: List(queries.DiaryEntry)) {
  let total_calories = list.fold(entries, 0.0, fn(acc, e) { acc +. e.calories })
  let total_added_sugars = total_macro(entries, entry_added_sugars)
  let total_protein_grams = total_macro(entries, entry_protein_grams)
  let total_fat_grams = total_macro(entries, entry_fat_grams)
  html.li([attribute.class("grid grid-cols-6 -ml-4 mb-6")], [
    html.div([], [
      date_badge([attribute.class("col-span-1")], day),
      entry_macro_view(total_calories, "", "KCAL"),
    ]),
    html.ul(
      [attribute.class("col-span-5 mb-6")],
      list.prepend(
        list.map(
          list.sort(entries, fn(a, b) {
            string.compare(a.consumed_at, b.consumed_at)
          }),
          diary_entry_item,
        ),
        html.li([attribute.class("mb-4")], [
          html.div([attribute.class("flex flex-row justify-around")], [
            entry_macro_view(total_added_sugars, "g", "Added Sugar"),
            entry_macro_view(total_protein_grams, "g", "Protein"),
            entry_macro_view(total_fat_grams, "g", "Total Fat"),
          ]),
        ]),
      ),
    ),
  ])
}

fn pluralize(x: Float, singular, plural) {
  case x, int.to_float(float.truncate(x)) {
    1.0, 1.0 -> "1 " <> singular
    x, _ if x <. 1.0 -> float.to_string(x) <> " " <> singular
    x, y if x == y -> int.to_string(float.truncate(x)) <> " " <> plural
    _, _ -> float.to_string(x) <> " " <> plural
  }
}

fn diary_entry_item(entry: queries.DiaryEntry) {
  let assert Ok(local_tz) = gtz.local_name() |> gtz.timezone

  html.li([attribute.class("mb-4")], [
    html.p([attribute.class("font-semibold")], [
      html.text(
        float.truncate(entry.calories) |> int.to_string
        <> " kcal, "
        <> entry_total_macro(entry, entry_protein_grams)
        |> float.truncate
        |> int.to_string
        <> "g protein",
      ),
    ]),
    case entry.nutrition_item, entry.recipe {
      Some(item), None -> diary_entry_nutrition_item(item)
      None, Some(recipe) -> diary_entry_recipe(recipe)
      _, _ -> html.text(int.to_string(entry.id))
    },
    html.p([attribute.class("flex justify-between text-sm")], [
      html.text(
        pluralize(entry.servings, "serving", "servings")
        <> " at "
        <> datetime.literal(entry.consumed_at)
        |> datetime.to_timezone(local_tz)
        |> datetime.format(tempo.Custom("h:mm A")),
      ),
      html.span([], [
        html.a(
          [
            attribute.href(
              "/diary_entry/" <> int.to_string(entry.id) <> "/edit",
            ),
          ],
          [
            html.text("Edit"),
          ],
        ),
        html.button(
          [attribute.class("ml-2"), event.on_click(UserDeletedEntry(entry))],
          [html.text("Delete")],
        ),
      ]),
    ]),
    case entry.recipe {
      Some(_recipe) ->
        html.p([], [
          html.span(
            [
              attribute.class(
                "bg-slate-400 text-slate-50 px-2 py-1 rounded text-xs",
              ),
            ],
            [html.text("RECIPE")],
          ),
        ])
      _ -> html.text("")
    },
  ])
}

fn diary_entry_nutrition_item(item: queries.NutritionItem) {
  let href = "/nutrition_item/" <> item.id |> int.to_string

  html.p([], [html.a([attribute.href(href)], [html.text(item.description)])])
}

fn diary_entry_recipe(recipe: queries.Recipe) {
  let href = "/recipe/" <> recipe.id |> int.to_string

  html.p([], [html.a([attribute.href(href)], [html.text(recipe.name)])])
}

pub type DiaryEntryEditFormData {
  DiaryEntryEditFormData(entry_id: String, servings: Float, consumed_at: String)
}

fn diary_entry_edit_form(entry_id: String) -> Form(DiaryEntryEditFormData) {
  form.new({
    use servings <- form.field("servings", { form.parse_float })
    use consumed_at <- form.field("consumed_at", { form.parse_string })
    form.success(DiaryEntryEditFormData(
      entry_id: entry_id,
      servings: servings,
      consumed_at: consumed_at,
    ))
  })
}

fn diary_entry_edit_route(
  entry_id: String,
  entry: Option(queries.DiaryEntry),
  form: Form(DiaryEntryEditFormData),
) -> Element(Msg) {
  let submitted = fn(fields) {
    form
    |> form.add_values(fields)
    |> form.run
    |> UserSubmittedDiaryEntryEditForm
  }

  let href = case entry {
    Some(entry) ->
      case entry.nutrition_item, entry.recipe {
        Some(item), _ -> "/nutrition_item/" <> int.to_string(item.id)
        _, Some(recipe) -> "/recipe/" <> int.to_string(recipe.id)
        _, _ -> ""
      }
    None -> ""
  }

  html.div([], [
    html.div([attribute.class("flex space-x-4 mb-4")], [
      button_link([attribute.href("/")], [html.text("Back to Diary")]),
    ]),
    case entry {
      Some(entry) ->
        html.div([], [
          html.div([attribute.class("mb-4")], [
            html.p([attribute.class("text-2xl")], [
              html.text(case entry.nutrition_item, entry.recipe {
                Some(item), _ -> item.description
                _, Some(recipe) -> recipe.name
                _, _ -> "Unknown"
              }),
            ]),
            html.p([attribute.class("text-indigo-600")], [
              html.a([attribute.href(href)], [html.text("View Detail")]),
            ]),
          ]),
          html.form([event.on_submit(submitted)], [
            html.fieldset([attribute.class("flex flex-col")], [
              html.label([attribute.for("servings")], [html.text("Servings")]),
              html.input([
                attribute.id("servings"),
                attribute.type_("number"),
                attribute.inputmode("decimal"),
                attribute.step("0.1"),
                attribute.value(float.to_string(entry.servings)),
              ]),
            ]),
            html.fieldset([attribute.class("flex flex-col")], [
              html.label([attribute.for("consumed_at")], [
                html.text("Consumed At"),
              ]),
              html.input([
                attribute.id("consumed_at"),
                attribute.type_("datetime-local"),
                attribute.value(
                  datetime.literal(entry.consumed_at)
                  |> datetime.format(tempo.Custom("YYYY-MM-DDTHH:mm")),
                ),
              ]),
            ]),
            html.fieldset([attribute.class("mt-4 mb-4")], [
              html.button(
                [
                  attribute.class(
                    "bg-indigo-600 text-slate-50 py-3 w-full text-xl font-semibold",
                  ),
                  attribute.type_("submit"),
                  // TODO
                // attribute.disabled(disabled()),
                ],
                [html.text("Save")],
              ),
            ]),
          ]),
        ])
      _ -> html.text("DiaryEntry with id " <> entry_id <> " not found")
    },
  ])
}

fn button_link(attrs, children) {
  html.a(
    list.append(attrs, [
      attribute.class(
        "bg-indigo-600 text-slate-50 py-2 px-3 text-lg rounded-md",
      ),
    ]),
    children,
  )
}

fn button(attrs, children) {
  html.button(
    list.append(attrs, [
      attribute.class(
        "bg-indigo-600 text-slate-50 py-2 px-3 text-lg rounded-md",
      ),
    ]),
    children,
  )
}
