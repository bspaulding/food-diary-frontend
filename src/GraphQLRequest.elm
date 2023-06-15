module GraphQLRequest exposing (..)

import Http
import Json.Encode as E


type alias GraphQLRequest =
    { query : String, variables : E.Value }


encode : GraphQLRequest -> E.Value
encode req =
    E.object [ ( "query", E.string req.query ), ( "variables", req.variables ) ]


make : GraphQLRequest -> Http.Expect msg -> Cmd msg
make req expect =
    Http.request
        { method = "POST"
        , headers = [ Http.header "x-hasura-admin-secret" admin_secret ]
        , url = "https://food-diary.motingo.com/api/v1/graphql"
        , body = encode req |> Http.jsonBody
        , expect = expect
        , timeout = Nothing
        , tracker = Nothing
        }


admin_secret =
    "da19f0c00aa8662072c2b30e378cb25cca7b95f319a151f74b3ee52777b837f3c71bb25ff349d36cf3070fcd1664006976c189acbe0832ad6cd09b97d1cbd1ee4d22fc3ac6621212fa9ac69505aaa19480f86e382b1c01e3a6d69eb5678105283078d466cb5c0d1ccca85aab9269ab44c21bedd6694db6a572beef8609b1ce96"
