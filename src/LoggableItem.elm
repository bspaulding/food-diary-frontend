module LoggableItem exposing (..)

import DiaryEntry exposing (DiaryEntry, RecentEntry(..))


type LoggableItem
    = LoggableItem { title : String, id : Int }
    | LoggableRecipe { title : String, id : Int }


id : LoggableItem -> Int
id loggable =
    case loggable of
        LoggableItem item ->
            item.id

        LoggableRecipe recipe ->
            recipe.id


title : LoggableItem -> String
title loggable =
    case loggable of
        LoggableItem item ->
            item.title

        LoggableRecipe recipe ->
            recipe.title


nullItem =
    LoggableItem { title = "Unknown Item", id = -1 }


fromEntries : List DiaryEntry -> List LoggableItem
fromEntries =
    List.map fromEntry


fromEntry : DiaryEntry -> LoggableItem
fromEntry entry =
    case entry.nutrition_item of
        Just item ->
            LoggableItem { id = item.id, title = item.description }

        Nothing ->
            case entry.recipe of
                Just recipe ->
                    LoggableRecipe { id = recipe.id, title = recipe.name }

                Nothing ->
                    nullItem


fromRecentEntries : List RecentEntry -> List LoggableItem
fromRecentEntries =
    List.map fromRecentEntry


fromRecentEntry : RecentEntry -> LoggableItem
fromRecentEntry entry =
    case entry of
        RecentEntryItem eid etitle consumed_at ->
            LoggableItem { id = eid, title = etitle }

        RecentEntryRecipe eid etitle consumed_at ->
            LoggableRecipe { id = eid, title = etitle }
