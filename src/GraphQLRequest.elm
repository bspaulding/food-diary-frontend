module GraphQLRequest exposing (..)

import Http
import Json.Encode as E
import OAuth


audience =
    "https://direct-satyr-14.hasura.app/v1/graphql"


endpoint =
    "https://food-diary.motingo.com/api/v1/graphql"


type alias GraphQLRequest =
    { query : String, variables : E.Value }


encode : GraphQLRequest -> E.Value
encode req =
    E.object [ ( "query", E.string req.query ), ( "variables", req.variables ) ]


make : GraphQLRequest -> OAuth.Token -> Http.Expect msg -> Cmd msg
make req token expect =
    Http.request
        { method = "POST"
        , headers = OAuth.useToken token []
        , url = endpoint
        , body = encode req |> Http.jsonBody
        , expect = expect
        , timeout = Nothing
        , tracker = Nothing
        }
