module Route exposing (..)

import Url.Parser exposing ((</>), Parser, int, map, oneOf, s, string, top)


type Route
    = NotFound
    | DiaryEntryList
    | DiaryEntryCreate
    | NutritionItem Int
    | NutritionItemCreate
    | NutritionItemEdit Int
    | Recipe Int
    | RecipeCreate
    | RecipeEdit Int


parser : Parser (Route -> a) a
parser =
    oneOf
        [ map DiaryEntryList top
        , map DiaryEntryCreate (s "diary_entry" </> s "new")
        , map NutritionItem (s "nutrition_item" </> int)
        , map NutritionItemCreate (s "nutrition_item" </> s "new")
        , map NutritionItemEdit (s "nutrition_item" </> int </> s "edit")
        , map Recipe (s "recipe" </> int)
        , map RecipeCreate (s "recipe" </> s "new")
        , map RecipeEdit (s "recipe" </> int </> s "edit")
        ]


parse url =
    Maybe.withDefault NotFound (Url.Parser.parse parser url)
