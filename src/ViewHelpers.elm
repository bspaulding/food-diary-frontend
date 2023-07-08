module ViewHelpers exposing (btn)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)


btn f label =
    button [ onClick f, class "ml-2 bg-indigo-600 text-slate-50 py-1 px-3 text-lg rounded-md" ] [ text label ]
