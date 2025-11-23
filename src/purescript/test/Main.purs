module Test.Main where

import Prelude
import Effect (Effect)
import Test.Spec.Reporter (consoleReporter)
import Test.Spec.Runner.Node (runSpecAndExitProcess)
import CSVImportTest as CSVImportTest
import CSVExportTest as CSVExportTest

main :: Effect Unit
main = runSpecAndExitProcess [consoleReporter] do
    CSVImportTest.spec
    CSVExportTest.spec