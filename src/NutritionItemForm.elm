module NutritionItemForm exposing (..)

import Form
import Form.Field as Field
import Form.FieldView as FieldView
import Form.Validation as Validation
import GraphQLRequest exposing (GraphQLRequest)
import Html exposing (..)
import Html.Attributes exposing (..)
import Json.Decode as D
import Json.Encode as E


type alias NutritionItemForm =
    { description : String
    , calories : Float
    , totalFatGrams : Float
    , saturatedFatGrams : Float
    , transFatGrams : Float
    , polyunsaturatedFatGrams : Float
    , monounsaturatedFatGrams : Float
    , cholesterolMilligrams : Float
    , sodiumMilligrams : Float
    , totalCarbohydrateGrams : Float
    , dietaryFiberGrams : Float
    , totalSugarsGrams : Float
    , addedSugarsGrams : Float
    , proteinGrams : Float
    }


encodeNutritionItem : NutritionItemForm -> E.Value
encodeNutritionItem form =
    E.object
        [ ( "description", E.string form.description )
        , ( "calories", E.float form.calories )
        , ( "total_fat_grams", E.float form.totalFatGrams )
        , ( "saturated_fat_grams", E.float form.saturatedFatGrams )
        , ( "trans_fat_grams", E.float form.transFatGrams )
        , ( "polyunsaturated_fat_grams", E.float form.polyunsaturatedFatGrams )
        , ( "monounsaturated_fat_grams", E.float form.monounsaturatedFatGrams )
        , ( "cholesterol_milligrams", E.float form.cholesterolMilligrams )
        , ( "sodium_milligrams", E.float form.sodiumMilligrams )
        , ( "total_carbohydrate_grams", E.float form.totalCarbohydrateGrams )
        , ( "dietary_fiber_grams", E.float form.dietaryFiberGrams )
        , ( "total_sugars_grams", E.float form.totalSugarsGrams )
        , ( "added_sugars_grams", E.float form.addedSugarsGrams )
        , ( "protein_grams", E.float form.proteinGrams )
        ]


type alias FormError =
    String


floatInvalid =
    { invalid = \str -> "'" ++ str ++ "' is not a number" }


nutritionItemForm : Form.HtmlForm FormError NutritionItemForm () msg
nutritionItemForm =
    Form.form nutritionItemFormCombineAndView
        |> Form.field "description" (Field.text |> Field.required "Required")
        |> Form.field "calories" (Field.float floatInvalid |> Field.required "Required")
        |> Form.field "totalFatGrams" (Field.float floatInvalid |> Field.required "Required")
        |> Form.field "saturatedFatGrams" (Field.float floatInvalid |> Field.required "Required")
        |> Form.field "transFatGrams" (Field.float floatInvalid |> Field.required "Required")
        |> Form.field "polyunsaturatedFatGrams" (Field.float floatInvalid |> Field.required "Required")
        |> Form.field "monounsaturatedFatGrams" (Field.float floatInvalid |> Field.required "Required")
        |> Form.field "cholesterolMilligrams" (Field.float floatInvalid |> Field.required "Required")
        |> Form.field "sodiumMilligrams" (Field.float floatInvalid |> Field.required "Required")
        |> Form.field "totalCarbohydrateGrams" (Field.float floatInvalid |> Field.required "Required")
        |> Form.field "dietaryFiberGrams" (Field.float floatInvalid |> Field.required "Required")
        |> Form.field "totalSugarsGrams" (Field.float floatInvalid |> Field.required "Required")
        |> Form.field "addedSugarsGrams" (Field.float floatInvalid |> Field.required "Required")
        |> Form.field "proteinGrams" (Field.float floatInvalid |> Field.required "Required")


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
            |> List.map (\error -> Html.li [ Html.Attributes.style "color" "red" ] [ Html.text error ])
            |> Html.ul []

    else
        Html.ul [] []


nutritionItemFormCombineAndView description calories totalFatGrams saturatedFatGrams transFatGrams polyunsaturatedFatGrams monounsaturatedFatGrams cholesterolMilligrams sodiumMilligrams totalCarbohydrateGrams dietaryFiberGrams totalSugarsGrams addedSugarsGrams proteinGrams =
    { combine =
        Validation.succeed NutritionItemForm
            |> Validation.andMap description
            |> Validation.andMap calories
            |> Validation.andMap totalFatGrams
            |> Validation.andMap saturatedFatGrams
            |> Validation.andMap transFatGrams
            |> Validation.andMap polyunsaturatedFatGrams
            |> Validation.andMap monounsaturatedFatGrams
            |> Validation.andMap cholesterolMilligrams
            |> Validation.andMap sodiumMilligrams
            |> Validation.andMap totalCarbohydrateGrams
            |> Validation.andMap dietaryFiberGrams
            |> Validation.andMap totalSugarsGrams
            |> Validation.andMap addedSugarsGrams
            |> Validation.andMap proteinGrams
    , view =
        \formState ->
            [ fieldset [ class "flex flex-col" ]
                (fieldView formState "description" "Description" [] description)
            , fieldset [ class "flex flex-col my-4" ]
                ([ legend [ class "font-semibold" ] [ text "Nutrition Facts" ] ]
                    ++ fieldView formState "calories" "Calories" [ step "0.1" ] calories
                    ++ fieldView formState "total-fat-grams" "Total Fat (g)" [ step "0.1" ] totalFatGrams
                    ++ fieldView formState "saturated-fat-grams" "Saturated Fat (g)" [ step "0.1" ] saturatedFatGrams
                    ++ fieldView formState "trans-fat-grams" "Trans Fat (g)" [ step "0.1" ] transFatGrams
                    ++ fieldView formState "polyunsaturated-fat-grams" "Polyunsaturated Fat (g)" [ step "0.1" ] polyunsaturatedFatGrams
                    ++ fieldView formState "monounsaturated-fat-grams" "Monounsaturated Fat (g)" [ step "0.1" ] monounsaturatedFatGrams
                    ++ fieldView formState "cholesterol-milligrams" "Cholesterol (mg)" [ step "0.1" ] cholesterolMilligrams
                    ++ fieldView formState "sodium-milligrams" "Sodium (mg)" [ step "0.1" ] sodiumMilligrams
                    ++ fieldView formState "total-carbohydrate-grams" "Total Carbohydrate (g)" [ step "0.1" ] totalCarbohydrateGrams
                    ++ fieldView formState "dietary-fiber-grams" "Dietary Fiber (g)" [ step "0.1" ] dietaryFiberGrams
                    ++ fieldView formState "total-sugars-grams" "Total Sugars (g)" [ step "0.1" ] totalSugarsGrams
                    ++ fieldView formState "added-sugars-grams" "Added Sugars (g)" [ step "0.1" ] addedSugarsGrams
                    ++ fieldView formState "protein-grams" "Protein (g)" [ step "0.1" ] proteinGrams
                )
            , fieldset [ class "mb-4" ]
                (if formState.submitting then
                    [ button [ disabled True, class "bg-indigo-600 text-slate-50 py-3 w-full text-xl font-semibold" ] [ text "Saving..." ] ]

                 else
                    [ button [ class "bg-indigo-600 text-slate-50 py-3 w-full text-xl font-semibold" ] [ text "Save" ] ]
                )
            ]
    }


createNutritionItemQuery : NutritionItemForm -> GraphQLRequest
createNutritionItemQuery form =
    { query = """
mutation CreateNutritionItem($nutritionItem: food_diary_nutrition_item_insert_input!) {
\tinsert_food_diary_nutrition_item_one(object: $nutritionItem) {
    id
  }
}
    """
    , variables = E.object [ ( "nutritionItem", encodeNutritionItem form ) ]
    }


decodeNutritionItemCreateResponse : String -> Result D.Error Int
decodeNutritionItemCreateResponse =
    D.decodeString (D.at [ "data", "insert_food_diary_nutrition_item_one", "id" ] D.int)
