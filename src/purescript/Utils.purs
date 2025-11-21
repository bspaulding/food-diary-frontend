module Utils where

import Prelude
import Effect (Effect)
import Effect.Uncurried (EffectFn1, runEffectFn1)

-- Note: accessorsToObject is SolidJS-specific and won't be needed in React/PureScript
-- In React, you'll use regular state values directly instead of accessors

-- Pluralization function
pluralize :: Int -> String -> String -> String
pluralize n singular plural =
  show n <> " " <> if n == 1 then singular else plural

-- Date formatting functions (using FFI for Intl.DateTimeFormat)
foreign import parseAndFormatTimeImpl :: EffectFn1 String String

parseAndFormatTime :: String -> Effect String
parseAndFormatTime timestamp = runEffectFn1 parseAndFormatTimeImpl timestamp

foreign import parseAndFormatDayImpl :: EffectFn1 String String

parseAndFormatDay :: String -> Effect String
parseAndFormatDay timestamp = runEffectFn1 parseAndFormatDayImpl timestamp

