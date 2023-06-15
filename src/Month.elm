module Month exposing (..)

import Time exposing (..)


intToString : Int -> String
intToString i =
    toString (fromInt i)


toString : Time.Month -> String
toString month =
    case month of
        Jan ->
            "Jan"

        Feb ->
            "Feb"

        Mar ->
            "Mar"

        Apr ->
            "Apr"

        May ->
            "May"

        Jun ->
            "Jun"

        Jul ->
            "Jul"

        Aug ->
            "Aug"

        Sep ->
            "Sep"

        Oct ->
            "Oct"

        Nov ->
            "Nov"

        Dec ->
            "Dec"


fromInt : Int -> Time.Month
fromInt month =
    case month of
        0 ->
            Jan

        1 ->
            Feb

        2 ->
            Mar

        3 ->
            Apr

        4 ->
            May

        5 ->
            Jun

        6 ->
            Jul

        7 ->
            Aug

        8 ->
            Sep

        9 ->
            Oct

        10 ->
            Nov

        11 ->
            Dec

        _ ->
            Dec


toInt : Time.Month -> Int
toInt month =
    case month of
        Jan ->
            0

        Feb ->
            1

        Mar ->
            2

        Apr ->
            3

        May ->
            4

        Jun ->
            5

        Jul ->
            6

        Aug ->
            7

        Sep ->
            8

        Oct ->
            9

        Nov ->
            10

        Dec ->
            11
