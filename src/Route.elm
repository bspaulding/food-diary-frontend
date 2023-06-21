module Route exposing (..)

import Url.Parser exposing ((</>), Parser, int, map, oneOf, s, string, top)


type DiaryEntryCreateTab
    = Suggestions
    | Search


type Route
    = NotFound
    | DiaryEntryList
    | DiaryEntryCreate DiaryEntryCreateTab
    | ImportEntries
    | NutritionItem Int
    | NutritionItemCreate
    | NutritionItemEdit Int
    | Recipe Int
    | RecipeCreate
    | RecipeEdit Int
    | Profile


parser : Parser (Route -> a) a
parser =
    oneOf
        [ map DiaryEntryList top
        , map (DiaryEntryCreate Suggestions) (s "diary_entry" </> s "new")
        , map (DiaryEntryCreate Suggestions) (s "diary_entry" </> s "new" </> s "suggestions")
        , map (DiaryEntryCreate Search) (s "diary_entry" </> s "new" </> s "search")
        , map ImportEntries (s "diary_entry" </> s "import")
        , map NutritionItem (s "nutrition_item" </> int)
        , map NutritionItemCreate (s "nutrition_item" </> s "new")
        , map NutritionItemEdit (s "nutrition_item" </> int </> s "edit")
        , map Recipe (s "recipe" </> int)
        , map RecipeCreate (s "recipe" </> s "new")
        , map RecipeEdit (s "recipe" </> int </> s "edit")
        , map Profile (s "profile")
        ]


parse url =
    Maybe.withDefault NotFound (Url.Parser.parse parser url)
