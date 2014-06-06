#Includes

	require './stringshims'
	PartOfSpeech = require('./part-of-speech')
	_ = require 'lodash'

#InputOption

	class InputOption
		constructor: (@text = "", @match = [], @suggestion = {words: []}, @completion = [], @result = {}) ->

		handleString: (string, partOfSpeech, id, value) ->
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
				thisTextContainsString = @text.toLowerCase().startsWith(string.toLowerCase())
				stringContainsThisText = string.toLowerCase().startsWith(@text.toLowerCase())

This is a match, and fully consumed

				if thisTextContainsString
					newMatch.push(newWord)
					newText = @text.substring(string.length)

This is a match, and partially consumed

				else if stringContainsThisText
					newSuggestion =
						charactersComplete: @text.length
						words: [ newWord ]
					newText = ""

This is not a match at all

				else
					return null

Then, modify the result
	
			newResult[id] = value

And send it on (if there is a match)
			
			return new InputOption(newText, newMatch, newSuggestion, newCompletion, newResult)

	module.exports = InputOption

