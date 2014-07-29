#Includes

	require './stringshims'
	PartOfSpeech = require('./part-of-speech')
	_ = require 'lodash'

#InputOption

	class InputOption
		constructor: (@options, @sentence = null, @text = "", @match = [], @suggestion = {words: []}, @completion = [], @result = {}) ->

		handleValue: (id, value) ->
			newResult = _.cloneDeep(@result)
			if typeof value is 'undefined'
				delete newResult[id]
			else
				newResult[id] = value
			return new InputOption(@options, @sentence, @text, @match, @suggestion, @completion, newResult)

		clearTemps: ->
			newResult = _.cloneDeep(@result)
			delete newResult[id] for id of newResult when id.startsWith('@temp')
			return new InputOption(@options, @sentence, @text, @match, @suggestion, @completion, newResult)


		replaceResult: (newResult) ->
			return new InputOption(@options, @sentence, @text, @match, @suggestion, @completion, newResult)

Returns an integer representing how many characters to consume, or null for no match

		doesStringContainThisText: (string) ->
			if @options?.fuzzy
				fuzzyRegexString = _.reduce @text, (whole, character) ->
					return "#{whole}#{character}.*?"
				, '^.*?'
				fuzzyRegex = new RegExp(fuzzyRegexString, 'i')
				return string.match(fuzzyRegex)?[0]?.length
			else
				return if string.toLowerCase().startsWith(@text.toLowerCase()) then @text.length else null

		doesThisTextContainString: (string) ->
			# if @options?.fuzzy
			# 	fuzzyRegexString = _.reduce string, (whole, character) ->
			# 		return "#{whole}#{character}.*?"
			# 	, '^.*?'
			# 	fuzzyRegex = new RegExp(fuzzyRegexString, 'i')
			# 	console.log fuzzyRegex
			# 	return @text.match(fuzzyRegex)?[0]?.length
			# else
			return if @text.toLowerCase().startsWith(string.toLowerCase()) then string.length else null

		handleString: (string, partOfSpeech) ->
			newText = @text
			newMatch = _.cloneDeep(@match)
			newSuggestion = _.cloneDeep(@suggestion)
			newCompletion = _.cloneDeep(@completion)
			newResult = _.cloneDeep(@result)

			newWord =
				string: string
				partOfSpeech: partOfSpeech

			if @text.length is 0

There is no suggestion, but the text is complete - this belongs in the suggestion!

				if @suggestion.words?.length is 0
					newSuggestion =
						charactersComplete: 0
						words: [ newWord ]

There is a suggestion, but this is a punctuation - tack it onto the end

				else if @completion.length is 0 and partOfSpeech is PartOfSpeech.punctuation
					newSuggestion.words.push(newWord)

This is a completion

				else
					newCompletion.push(newWord)

This is a part of the text

			else
				thisTextContainsString = @doesThisTextContainString(string)
				stringContainsThisText = @doesStringContainThisText(string)

This is a match, and fully consumed

				if thisTextContainsString?
					newMatch.push(newWord)
					newText = @text.substring(thisTextContainsString)

This is a match, and partially consumed

				else if stringContainsThisText?
					newSuggestion =
						charactersComplete: stringContainsThisText
						words: [ newWord ]
					newText = ""

This is not a match at all

				else
					return null

And send it on (if there is a match)
			
			return new InputOption(@options, @sentence, newText, newMatch, newSuggestion, newCompletion, newResult)

	module.exports = InputOption

