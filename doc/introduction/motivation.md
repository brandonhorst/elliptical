# Why Elliptical

Elliptical is used to build interactive natural language text interfaces.
For certain applications, this is a much more powerful and natural
interface than a traditional GUI or command line.

Let's say I want to make a tool that reminds me
to do something at a certain time.
There are a million ways to do this on a modern computer or smartphone -
various GUI applications, spoken-word tools like Siri, or
command line interfaces.

However, the most natural way to do something like this is to use
plain old natural langauge text. The interface is immediately familiar,
effecient, accurate, and friendly. For users at a keyboard (i.e. most people
doing work), a natural language text interface is the simplest, most natural
solution.

However, building one is hard. When you do your sketches, you realize that
there are *tons* of ways to say this with natural language. For example:


* remind me to go shoe shopping tomorrow at 8am
* tomorrow at 8am, remind me to go shoe shopping
* remind me to go shoe shopping at 8am the day after tomorrow
* remind me to go shoe shopping tomorrow morning
* remind me to go shoe shopping on the morning of the 23rd
* remind me to go shoe shopping next monday at 8

Those are just a few examples - I'm sure you could think of many more.
Moreover, if you really want the tool to "understand anything that you would
say to a friend," more complicated options arise.

* remind me to go shoe shopping the day before Jake's birthday
* remind me to go shoe shopping 2 weeks before my vacation
* remind me to go shoe shopping next time I go grocery shopping

Moreover, for efficiency, it should allow for autocomplete (perhaps by pressing
the tab key). Fuzzy matching would be nice, so the user can skip a few
keystrokes. Syntax highlighting would probably be handy too.

At this point, you have 3 options.

- Devote the next year+ to developing this single-purpose product
- Give up and just build another mediocre GUI
- `npm install elliptical`

## The Elliptical Solution

Lacona is designed to understand inputs like *these*,
it's designed to make the best possible interface for the end user,
and it's designed to make the developer's life as simple as possible.

### Phrases

With elliptical, the developer doesn't need to know the intricacies of
language parsing - they can construct their language
parser by combining existing building blocks.

```
'remind me to' {task name} {date and time}
-OR-
{date and time}, 'remind me to' {task name}
```

All of a sudden, that doesn't look to bad. Because
`{task name}` and a `{date and time}` are
abstracted away, they can be addressed and reasoned about independently.

# Interactive

Elliptical is designed to not only understand a completed input, but
suggest completions to an incomplete one, in realtime. It provides
intelligent sorting, smart qualifications, autocomplete, syntax highlighting,
and more.

# Extensibility

Elliptical is designed in a modern, functional, extensible way. You can use
not only custom phrases, but addons which add whole categories of functionality,
such as

- [Asyncronous sideways data loading](https://github.com/brandonhorst/elliptical-observe)
- [Linguistic extension](https://github.com/brandonhorst/elliptical-extend)
- [Internationalization](https://github.com/brandonhorst/elliptical-translate)

## The Appeal

Elliptical can be used to build an entirely new category of interfaces. To see
one working application, check out [Lacona](http://lacona.io/), a natural
language command line for Mac.