module HttpExtra exposing (..)

import Http exposing (..)


errorToString : Http.Error -> String
errorToString error =
    case error of
        BadUrl url ->
            "BadUrl " ++ url

        Timeout ->
            "Timeout"

        NetworkError ->
            "NetworkError"

        BadStatus status ->
            "BadStatus " ++ String.fromInt status

        BadBody body ->
            "BadBody " ++ body
