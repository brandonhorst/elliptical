#Includes

    {EventEmitter} = require 'events'

#Lacona

    class Parser extends EventEmitter
        schemas: []
        options: {}

        parse: (input, context) ->
            @emit 'end'

    module.exports =
        Parser: Parser
