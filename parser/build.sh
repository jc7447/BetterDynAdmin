#!/bin/bash
pegjs -e BDA_DASH_PARSER dash.grammar.pegjs bda.dash.parser.js

pegjs -e DASH_LINES_SPLITTER dash.splitter.grammar.pegjs bda.dash.line.splitter.js