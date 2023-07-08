module RecipeForm exposing (..)

import Dict exposing (Dict)
import Form
import Form.Field as Field
import Form.FieldView as FieldView
import Form.Validation as Validation
import GraphQLRequest exposing (GraphQLRequest)
import Html exposing (..)
import Html.Attributes as Attrs exposing (..)
import Html.Events exposing (..)
import Json.Decode as D
import Json.Encode as E
import LoggableItem exposing (LoggableItem, loggableItemSearch)
import NutritionItem exposing (NutritionItem)
import Recipe exposing (RecipeItem)
import StringExtra exposing (pluralize)


type alias RecipeForm =
    { name : String
    , totalServings : Float
    }


type alias RecipeFormRecipeItem =
    { servings : Float, item : LoggableItem }


encode : RecipeForm -> E.Value
encode form =
    E.object
        [ ( "name", E.string form.name )
        , ( "total_servings", E.float form.totalServings )
        ]


floatInvalid =
    { invalid = \str -> "'" ++ str ++ "' is not a number" }


type alias FormError =
    String


fieldView ctx name_ label_ attrs field =
    [ label [ for name_ ] [ text label_ ]
    , FieldView.input (attrs ++ [ name name_ ]) field
    , errorsView ctx field
    ]


errorsView :
    Form.Context String input
    -> Validation.Field String parsed kind
    -> Html msg
errorsView { submitAttempted, errors } field =
    if submitAttempted || Validation.statusAtLeast Validation.Blurred field then
        errors
            |> Form.errorsForField field
            |> List.map (\error -> Html.li [ style "color" "red" ] [ Html.text error ])
            |> Html.ul []

    else
        Html.ul [] []


recipeForm : LoggableItem.Model -> LoggableItem.LoggableMsgs msg -> List RecipeFormRecipeItem -> Form.HtmlForm FormError RecipeForm () msg
recipeForm loggableModel loggableMsgs recipeItems =
    Form.form
        (\title totalServings ->
            { combine =
                Validation.succeed RecipeForm
                    |> Validation.andMap title
                    |> Validation.andMap totalServings
            , view =
                \formState ->
                    [ h2 [ class "font-bold text-xl mt-4" ] [ text "New Recipe" ]
                    , fieldset [ class "flex flex-col" ]
                        ([ legend [ class "font-semibold" ] [ text "Info" ] ]
                            ++ fieldView formState "name" "Name" [] title
                            ++ fieldView formState "total-servings" "Total Servings" [] totalServings
                        )
                    , fieldset []
                        [ legend [ class "font-semibold" ] [ text "Items" ]
                        , small [] [ text (String.fromInt (List.length recipeItems) ++ pluralize (List.length recipeItems) " item" " items" ++ " in recipe.") ]
                        , ul []
                            (List.map
                                (recipeItem loggableMsgs.updateServings)
                                (List.map
                                    (\{ item } ->
                                        { item = item
                                        , servings = Maybe.withDefault 1 (Dict.get (LoggableItem.id item) loggableModel.activeLoggableServingsById)
                                        }
                                    )
                                    recipeItems
                                )
                            )
                        ]
                    , fieldset []
                        ([ legend [ class "font-semibold" ] [ text "Add New Items" ] ]
                            ++ loggableItemSearch loggableModel loggableMsgs
                        )
                    , fieldset [ class "mt-4" ]
                        [ button [ class "bg-indigo-600 text-slate-50 py-3 w-full text-xl font-semibold" ] [ text "Save Recipe" ] ]
                    ]
            }
        )
        |> Form.field "name" (Field.text |> Field.required "Required")
        |> Form.field "totalServings" (Field.float floatInvalid |> Field.required "Required" |> Field.withInitialValue (always 1.0))


recipeItem updateServings { servings, item } =
    li [ class "flex flex-row place-content-between items-center" ]
        [ p [] [ text (LoggableItem.title item) ]
        , input [ class "w-20", type_ "number", Attrs.min "0", onInput (updateServings item), value (String.fromFloat servings) ] []
        ]


createRecipeQuery : RecipeForm -> GraphQLRequest
createRecipeQuery form =
    { query = """
mutation CreateRecipe($recipe: food_diary_recipe_insert_input!) {
  insert_food_diary_recipe_one(object: $recipe) {
    id
  }
}    """
    , variables = E.object [ ( "recipe", encode form ) ]
    }


decodeRecipeCreateResponse : String -> Result D.Error Int
decodeRecipeCreateResponse =
    D.decodeString (D.at [ "data", "insert_food_diary_recipe_one", "id" ] D.int)
