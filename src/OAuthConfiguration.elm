module OAuthConfiguration exposing (..)

import Base64.Encode as Base64
import Bytes exposing (Bytes)
import Bytes.Encode as Bytes
import Json.Decode as D
import OAuth
import OAuth.AuthorizationCode.PKCE as OAuth
import Url exposing (Protocol(..), Url)


host =
    "motingo.auth0.com"


type alias Configuration =
    { authorizationEndpoint : Url
    , tokenEndpoint : Url
    , userInfoEndpoint : Url
    , userInfoDecoder : D.Decoder UserInfo
    , clientId : String
    , scope : List String
    }


type alias UserInfo =
    { name : String
    , picture : String
    }


configuration : Configuration
configuration =
    { authorizationEndpoint =
        { defaultHttpsUrl | host = host, path = "/authorize" }
    , tokenEndpoint =
        { defaultHttpsUrl | host = host, path = "/oauth/token" }
    , userInfoEndpoint =
        { defaultHttpsUrl | host = host, path = "/userinfo" }
    , userInfoDecoder =
        D.map2 UserInfo
            (D.field "name" D.string)
            (D.field "picture" D.string)
    , clientId =
        "NAk5igfLGjmTOsHjWPGDTens9FWbstN9"
    , scope =
        [ "openid", "profile" ]
    }


defaultHttpsUrl : Url
defaultHttpsUrl =
    { protocol = Https
    , host = ""
    , path = ""
    , port_ = Nothing
    , query = Nothing
    , fragment = Nothing
    }



-- Helpers


cSTATE_SIZE : Int
cSTATE_SIZE =
    8


cCODE_VERIFIER_SIZE : Int
cCODE_VERIFIER_SIZE =
    32


toBytes : List Int -> Bytes
toBytes =
    List.map Bytes.unsignedInt8 >> Bytes.sequence >> Bytes.encode


base64 : Bytes -> String
base64 =
    Base64.bytes >> Base64.encode


convertBytes : List Int -> Maybe { state : String, codeVerifier : OAuth.CodeVerifier }
convertBytes bytes =
    if List.length bytes < (cSTATE_SIZE + cCODE_VERIFIER_SIZE) then
        Nothing

    else
        let
            state =
                bytes
                    |> List.take cSTATE_SIZE
                    |> toBytes
                    |> base64

            mCodeVerifier =
                bytes
                    |> List.drop cSTATE_SIZE
                    |> toBytes
                    |> OAuth.codeVerifierFromBytes
        in
        Maybe.map (\codeVerifier -> { state = state, codeVerifier = codeVerifier }) mCodeVerifier
