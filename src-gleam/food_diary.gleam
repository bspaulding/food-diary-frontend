import gleam/io
import lustre
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html
import lustre/effect.{type Effect}
import food_diary/router
import food_diary/auth/auth0
import food_diary/models/app_state.{type AppState, AppState}

pub fn main() {
  let app = lustre.application(init, update, view)
  let assert Ok(_) = lustre.start(app, "#root", Nil)
  Nil
}

pub type Model {
  Model(
    state: AppState,
    route: router.Route,
    auth: auth0.AuthState,
  )
}

pub type Msg {
  UserAuthChanged(auth0.AuthState)
  RouteChanged(router.Route)
  ApiResponse(Result(String, String))
  NoOp
}

fn init(_flags: Nil) -> #(Model, Effect(Msg)) {
  let initial_route = router.parse_route(router.current_path())
  let model = Model(
    state: AppState(entries: [], nutrition_items: [], recipes: []),
    route: initial_route,
    auth: auth0.Unauthenticated,
  )
  #(model, auth0.init_auth(UserAuthChanged))
}

fn update(model: Model, msg: Msg) -> #(Model, Effect(Msg)) {
  case msg {
    UserAuthChanged(auth_state) -> #(
      Model(..model, auth: auth_state),
      effect.none(),
    )
    
    RouteChanged(new_route) -> #(
      Model(..model, route: new_route),
      effect.none(),
    )
    
    ApiResponse(_result) -> #(model, effect.none())
    
    NoOp -> #(model, effect.none())
  }
}

fn view(model: Model) -> Element(Msg) {
  html.div([attribute.class("font-sans text-slate-800 flex flex-col bg-slate-50 relative px-4 pt-20")], [
    view_header(model),
    view_content(model),
  ])
}

fn view_header(model: Model) -> Element(Msg) {
  html.header([attribute.class("fixed top-0 left-0 right-0 h-16 flex px-4 justify-start items-center bg-slate-50")], [
    html.h1([attribute.class("text-2xl font-bold")], [
      element.text("Food Diary")
    ]),
    case model.auth {
      auth0.Authenticated(user) ->
        html.div([attribute.class("absolute right-2 w-12 h-12")], [
          html.a([attribute.href("/profile")], [
            html.img([
              attribute.src(user.picture),
              attribute.class("border border-slate-800 rounded-full"),
            ])
          ])
        ])
      _ -> element.none()
    }
  ])
}

fn view_content(model: Model) -> Element(Msg) {
  case model.auth {
    auth0.Authenticated(_user) -> router.view_route(model.route, model.state)
    auth0.Unauthenticated -> view_login()
    auth0.Loading -> html.div([], [element.text("Loading...")])
  }
}

fn view_login() -> Element(Msg) {
  html.button(
    [
      attribute.class("bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"),
    ],
    [element.text("Log In")],
  )
}
