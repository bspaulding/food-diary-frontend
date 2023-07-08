module LoggableItem exposing (..)

import DiaryEntry exposing (DiaryEntry, RecentEntry(..))
import Dict exposing (Dict)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Json.Encode as E
import Set exposing (Set)
import StringExtra exposing (pluralize)
import ViewHelpers exposing (btn)


type LoggableItem
    = LoggableItem { title : String, id : Int }
    | LoggableRecipe { title : String, id : Int }


id : LoggableItem -> Int
id loggable =
    case loggable of
        LoggableItem item ->
            item.id

        LoggableRecipe recipe ->
            recipe.id


title : LoggableItem -> String
title loggable =
    case loggable of
        LoggableItem item ->
            item.title

        LoggableRecipe recipe ->
            recipe.title


nullItem =
    LoggableItem { title = "Unknown Item", id = -1 }


fromEntries : List DiaryEntry -> List LoggableItem
fromEntries =
    List.map fromEntry


fromEntry : DiaryEntry -> LoggableItem
fromEntry entry =
    case entry.nutrition_item of
        Just item ->
            LoggableItem { id = item.id, title = item.description }

        Nothing ->
            case entry.recipe of
                Just recipe ->
                    LoggableRecipe { id = recipe.id, title = recipe.name }

                Nothing ->
                    nullItem


fromRecentEntries : List RecentEntry -> List LoggableItem
fromRecentEntries =
    List.map fromRecentEntry


fromRecentEntry : RecentEntry -> LoggableItem
fromRecentEntry entry =
    case entry of
        RecentEntryItem eid etitle consumed_at ->
            LoggableItem { id = eid, title = etitle }

        RecentEntryRecipe eid etitle consumed_at ->
            LoggableRecipe { id = eid, title = etitle }



-- Views


type alias Model =
    { searchResults : List LoggableItem
    , activeLoggableItemIds : Set Int
    , activeLoggableServingsById : Dict Int Float
    , loggableSearchQuery : String
    }


type alias LoggableMsgs msg =
    { begin : LoggableItem -> msg
    , cancel : LoggableItem -> msg
    , submit : LoggableItem -> msg
    , updateServings : LoggableItem -> String -> msg
    , queryChanged : String -> msg
    }



-- TODO: take a param like SearchScope = ItemsOnly | RecipesOnly | ItemsAndRecipes
-- initially, this can just hide the results but still initiate the search prob is fine


loggableItemSearch : Model -> LoggableMsgs msg -> List (Html msg)
loggableItemSearch model msgs =
    [ section [ class "flex flex-col mt-5" ]
        [ input [ class "border rounded px-2 text-lg", type_ "search", placeholder "Search Items and Recipes", name "entry-item-search", onInput msgs.queryChanged, value model.loggableSearchQuery ] []
        , div [ class "px-1" ]
            (if List.length model.searchResults == 0 then
                [ p [ class "text-center mt-4 text-slate-400" ] [ text "Search for an item or recipe you've previously added." ] ]

             else
                [ p [ class "text-center mt-4 text-slate-400" ] [ text (String.fromInt (List.length model.searchResults) ++ pluralize (List.length model.searchResults) " item" " items") ]
                , loggableList model msgs (List.map (\l -> ( [ loggableTagView l ], l )) model.searchResults)
                ]
            )
        ]
    ]


loggableTagView : LoggableItem -> Html msg
loggableTagView loggable =
    case loggable of
        LoggableItem _ ->
            tagView "ITEM"

        LoggableRecipe _ ->
            tagView "RECIPE"


tagView : String -> Html msg
tagView label =
    span [ class "bg-slate-400 text-slate-50 px-2 py-1 rounded text-xs ml-8" ] [ text label ]


loggableList : Model -> LoggableMsgs msg -> List ( List (Html msg), LoggableItem ) -> Html msg
loggableList model msgs loggables =
    ul []
        (List.map
            (\( c, loggable ) ->
                loggableItem
                    msgs
                    c
                    loggable
                    (Set.member (id loggable) model.activeLoggableItemIds)
                    (Maybe.withDefault 1 (Dict.get (id loggable) model.activeLoggableServingsById))
            )
            loggables
        )


loggableItem : LoggableMsgs msg -> List (Html msg) -> LoggableItem -> Bool -> Float -> Html msg
loggableItem { begin, cancel, submit, updateServings } children loggable isActive servings =
    li []
        ([ div [ class "ml-7" ]
            ([ div [ class "flex items-center -ml-7" ]
                [ button
                    [ class "mr-1 text-3xl text-indigo-600 transition-transform"
                    , if isActive then
                        class "rotate-45"

                      else
                        class ""
                    , onClick
                        (if isActive then
                            cancel loggable

                         else
                            begin loggable
                        )
                    ]
                    [ text "⊕" ]
                , p [] [ a [ href ("/nutrition_item/" ++ String.fromInt (id loggable)) ] [ text (title loggable) ] ]
                ]
             ]
                ++ (if isActive then
                        [ loggableInput submit updateServings loggable servings ]

                    else
                        []
                   )
            )
         ]
            ++ children
        )


loggableInput : (LoggableItem -> msg) -> (LoggableItem -> String -> msg) -> LoggableItem -> Float -> Html msg
loggableInput submit updateServings loggable servings =
    div [ class "ml-2 flex" ]
        [ input [ type_ "number", property "inputmode" (E.string "decimal"), step "0.1", style "min-width" "50px", value (String.fromFloat servings), onInput (updateServings loggable) ] []
        , btn (submit loggable) "Save"
        ]
