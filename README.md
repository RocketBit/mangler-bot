# mangler-bot

Slack bot built in Node that mangles acronyms. 

Nothing fancy, thrown together, just for the LULZ

You can run it in dev mode by using `npm run dev`

Then POST to http://localhost:2095 with this payload:

```JavaScript
{
  "text": "TULIP",
  "twitter": false
}
```

where `text` is the acronym you'd like mangled, and `twitter` is whether or not to return the twitter-formatted response rather than the slack one.