module Main exposing (..)

import Browser exposing (Document)
import DiaryEntry exposing (DiaryEntry)
import GraphQLRequest exposing (GraphQLRequest)
import Html exposing (..)
import Http
import Json.Decode as D
import Json.Encode as E


type alias Model =
    { entries : List DiaryEntry }


type Msg
    = EntriesReceived (Result Http.Error String)


fetchEntriesQuery : GraphQLRequest
fetchEntriesQuery =
    { query = """
query FetchDiaryEntries {
  food_diary_diary_entry(order_by: { consumed_at: desc }, limit: 50) {
    id
    calories
    consumed_at
    nutrition_item {
      id
      added_sugars_grams
      calories
      cholesterol_milligrams
      description
      dietary_fiber_grams
      monounsaturated_fat_grams
      polyunsaturated_fat_grams
      protein_grams
      saturated_fat_grams
      sodium_milligrams
      total_carbohydrate_grams
      trans_fat_grams
      total_sugars_grams
      total_fat_grams
    }
    recipe {
      id
      calories
      name
      total_servings
      recipe_items {
        nutrition_item {
          added_sugars_grams
          calories
          cholesterol_milligrams
          description
          dietary_fiber_grams
          id
          monounsaturated_fat_grams
          polyunsaturated_fat_grams
          protein_grams
          saturated_fat_grams
          sodium_milligrams
          total_carbohydrate_grams
          total_fat_grams
          total_sugars_grams
          trans_fat_grams
        }
        servings
      }
    }
  }
}

"""
    , variables = E.object []
    }


fetchEntries : Cmd Msg
fetchEntries =
    GraphQLRequest.make fetchEntriesQuery (Http.expectString EntriesReceived)


main =
    Browser.document { init = init, view = view, update = update, subscriptions = subscriptions }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { entries = [] }, fetchEntries )


subscriptions : Model -> Sub msg
subscriptions _ =
    Sub.none


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        EntriesReceived (Err e) ->
            ( model, Cmd.none )

        EntriesReceived (Ok res) ->
            case DiaryEntry.decodeEntriesResponse res of
                Err err ->
                    Debug.log (D.errorToString err) ( model, Cmd.none )

                Ok entries ->
                    ( { model | entries = entries }, Cmd.none )


view : Model -> Document Msg
view model =
    { title = "Food Diary", body = body model }


body : Model -> List (Html Msg)
body model =
    [ h1 [] [ text "Food Diary" ]
    , ul [] (List.map entryItem model.entries)
    ]


entryItem : DiaryEntry -> Html Msg
entryItem entry =
    div [] [ text (DiaryEntry.title entry) ]
