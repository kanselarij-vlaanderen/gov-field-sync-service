# gov-field-sync-service
A service for handling the syncing of government fields.

A part of the [OSLO "besluitvorming"-model](https://data.vlaanderen.be/doc/applicatieprofiel/besluitvorming) is centered around a decision-flow (`besluitvorming:Besluitvormingsaangelegenheid`) that contains many government fields (`kans:Beleidsveld`). By means of specific relationships, a decision-flow can relate to a subset of these fields, thus representing that the decision-flow handles about these government fields.

In practice however, it is currently desired that government fields are assigned on a subcase, instead of first adding them to a decision-flow and linking to them afterward. Nonetheless, we want to keep the decision-flow's full set of government fields up to date for accordance to the OSLO-model, since this data will be used by other parties in the near future.

Keeping the decision-flow's government fields "in sync" each time the fields in a related entity gets updated, is difficult to fully cover in the frontend. This service listens to changes in the relationships to government fields through [delta's](https://github.com/mu-semtech/delta-notifier) and updates the decision-flow's government fields accordingly. The relations between these entities and government fields are defined as concepts (`skos:Concept`). The relevant concept scheme is used for both government domains (`kans:Beleidsdomein`) and government fields.

Another thing to note is that currently, the model for case and decision-flow is merged and named case (`dossier:Dossier`).
In future work, this will be split up to reflect the OSLO model better.

## Configuration
All configuration is hard-coded in `config.js`.

Use following snippet in delta-notifier config:
```js
{
  match: {
    predicate: {
      type: 'uri',
      value: 'https://data.vlaanderen.be/ns/besluitvorming#beleidsveld'
    }
  },
  callback: {
    url: 'http://gov-field-sync/delta',
    method: 'POST'
  },
  options: {
    resourceFormat: 'v0.0.1',
    gracePeriod: 5000,
    ignoreFromSelf: true
  }
}
```

## Available endpoints

#### POST /delta

Internal endpoint for receiving deltas from the [delta-notifier](https://github.com/mu-semtech/delta-notifier)

