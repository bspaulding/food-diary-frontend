module Msg exposing (Msg(..))

import Browser
import DiaryEntry exposing (DiaryEntry)
import Form
import Http
import LoggableItem exposing (LoggableItem)
import NutritionItemForm exposing (NutritionItemForm)
import OAuth.AuthorizationCode.PKCE as OAuth
import OAuthConfiguration exposing (UserInfo)
import RecipeForm exposing (RecipeForm)
import Time
import Url


type Msg
    = EntriesReceived (Result Http.Error String)
    | RecentItemsReceived (Result Http.Error String)
    | CreateDiaryEntryResponse LoggableItem (Result Http.Error String)
    | BeginLoggingItem LoggableItem
    | SubmitLoggingItem LoggableItem
    | CancelLoggingItem LoggableItem
    | UpdateLoggableServings LoggableItem String
    | AddItemToRecipe LoggableItem
    | NewTimeZone Time.Zone
    | LinkClicked Browser.UrlRequest
    | UrlChanged Url.Url
    | SignInRequested
    | GotRandomBytes (List Int)
    | GotAccessToken (Result Http.Error OAuth.AuthenticationSuccess)
    | UserInfoRequested
    | GotUserInfo (Result Http.Error UserInfo)
    | DeleteDiaryEntryRequested DiaryEntry
    | DeleteDiaryEntryResponse (Result Http.Error String)
    | DebouncerTimeout Int
    | SearchItemsAndRecipesResponse (Result Http.Error String)
    | ItemAndRecipeSearchUpdated String
    | FormMsg (Form.Msg Msg)
    | OnSubmitNutritionItemCreateForm (Form.Validated String NutritionItemForm)
    | NutritionItemCreateResponse (Result Http.Error String)
    | NutritionItemResponse (Result Http.Error String)
    | OnSubmitRecipeCreateForm (Form.Validated String RecipeForm)
    | RecipeCreateResponse (Result Http.Error String)
    | RecipeResponse (Result Http.Error String)
