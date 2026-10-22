# How the forecasting works

This file explains exactly how the platform produces its construction cost forecasts: what
goes in, what each model does, how often it runs, how the forecasts are checked, and how they
become the weekly notes and the opening prices of the forecasting contracts. Technical detail
is in `docs/FORECAST_MODEL.md` and `docs/MARKET_DESIGN.md`. Commands are listed at the end.

---

## 1. The idea in one paragraph

Official construction price indices tell you what prices did one to three months ago, and in
many countries there is no index at all. What moves construction input prices in these
economies is largely observable every week: **oil prices, the exchange rate, rainfall, public
spending and tax changes**. So each forecast starts from the latest official figure, adds what
these drivers have done since, and projects forward with a range of outcomes rather than a
single number. Every model is tested on past data, as if we had run it at the time, and is kept
only if it beats simple alternatives.

## 2. Four kinds of forecast, matched to the data each country has

| Forecast type | Countries | Used when | What it predicts |
|---|---|---|---|
| **Structural model** | Uganda | The office publishes the full index structure: components and weights | Every component of the index, rebuilt into the published indices |
| **Quarterly driver model** | Kenya | A quarterly official index with a few years of history | The next two quarterly prints of the overall, building and civil indices |
| **Contract nowcast** | South Africa | A monthly official index, but no driver model yet | Next month's change in each contracted series |
| **Cost-pressure outlook** | The other 15 countries | No usable official index | Pressure on input costs from oil and the currency over 3 and 6 months; an indicator, not a price index |

When a country gets a usable official series, it moves up a row: first contracts and the
nowcast, then a driver model, then a structural model if the weights are published.

## 3. What goes in

| Input | Source | Frequency | Used for |
|---|---|---|---|
| Official construction indices | UBOS (Uganda), KNBS (Kenya), Stats SA (South Africa); latest readings for Ghana, Zimbabwe, Senegal and Mauritius | Monthly or quarterly | Starting point, model fitting, contract settlement |
| Brent crude | EIA daily (FRED as fallback) | Daily, summarised weekly | Fuel, bitumen, transport, imported materials |
| Exchange rates (18 currencies) | currency-api weekly snapshots; IMF monthly history from 2015 | Weekly / monthly | Imported materials, local-currency oil |
| Iron ore, global supply-chain pressure (GSCPI) | IMF/FRED, New York Fed | Monthly | Steel components (Uganda) |
| CPI, interest rates, credit | UBOS, Bank of Uganda via MoFPED | Monthly | Domestic components (Uganda) |
| Rainfall | ERA5 via Open-Meteo, 5 Ugandan towns | Monthly | Quarry products (sand, aggregate, bricks) |
| Public spending | MoFPED fiscal operations (with its 2-month publication lag) | Monthly | Steel, cement, quarry products |
| Tax measures | `countries/uganda/policy_events.yaml`, each with sources | When enacted | Known one-off price jumps (e.g. July 2026 fuel and cement excise) |
| Prices reported by participants | The participant app | Weekly | Shown in the notes; a future model input. Never used to settle contracts |

## 4. The models step by step

### 4.1 Uganda — structural model (`src/forecast/model.py`)

1. **Rebuild the index exactly.** The UBOS workbook publishes each product's weight. About a third of
   the materials basket is not published, but because the index is fixed-weight, its price can be
   derived exactly. All four published indices (overall, buildings, civil, specialised) then rebuild
   from 29 components with an error of about 1e-13.
2. **Model each component's monthly change.** The inputs are the component's own last change and its
   group's drivers. For example, diesel and bitumen use oil and the exchange rate; steel uses iron
   ore, the exchange rate, supply-chain pressure and public spending; sand and aggregate use oil,
   CPI, rainfall and public spending. Price drivers enter in the same month and as an average of the
   previous three months. The fitting resists outliers (so one 2022-style month cannot dominate) and
   shrinks estimates toward zero (so ~100 months cannot produce wild coefficients).
3. **Project the drivers.** A small time-series model (a VAR) of the drivers projects them forward.
   Months already observed since the last UBOS release are **fixed at their actual values**: that is
   how weekly oil and currency readings update the forecast.
4. **Add known policy shocks.** For example, the July 2026 fuel excise adds 3.1% to diesel at full
   pass-through. The baseline assumes 50% pass-through, because history is mixed; scenarios show 0%
   and 100%.
5. **Simulate 2,000 futures.** Each draws past months' surprises, for the drivers and the components
   together and in 6-month blocks, so shocks keep their real persistence and co-movement. Each future
   also redraws every component's underlying trend.
6. **Rebuild the indices** from each simulated set of components using UBOS's weights. The median is
   the forecast, and the 10th–90th percentiles are the range.
7. **Calibrate the range.** In testing on past data, the raw 80% range was too narrow at long
   horizons, so it is widened by a factor learned from the backtest: ×1.00 at 1 month up to ×1.17 at
   12 months. After that, it covers 80% of past outcomes.

### 4.2 Kenya — quarterly driver model (`src/forecast/quarterly_model.py`)

- KNBS publishes quarterly, so there are only about 26 quarters. Each series gets one small equation:
  its last change, plus this quarter's and last quarter's changes in the shilling and in Brent priced
  in shillings, with strong shrinkage.
- Quarters already partly observed (e.g. 1 of 3 months of oil and currency data) are fixed at what
  has been seen; the rest is simulated from past quarters.
- The range comes from the model's **own past errors**, not the simulation, because the test sample
  is small.
- Only the overall, building and civil indices are forecast. For single materials the model did not
  beat a simple trend, so the note shows their latest readings instead.

### 4.3 South Africa — contract nowcast (`src/market/nowcast.py`)

- Stats SA rebases and reweights its index, so history is built by chaining each monthly release's
  **own** month-on-month change; rebasing cannot distort it.
- For each contracted series, next month's change is given as probabilities over outcome ranges.
  These are a 50/50 blend of a time-series model and recent frequencies of each range.
- A driver model (rand, oil, steel) is the next step.

### 4.4 The other 15 countries — cost-pressure outlook (`src/forecast/cost_pressure.py`)

```
monthly pressure = 0.10 × change in (Brent in local currency) + 0.40 × change in (local currency per USD)
```

- **Weights:** about 10% of a construction basket is fuel and transport, and about 40% is imported or
  import-priced materials. Those shares come from the official baskets in Uganda and Kenya.
- **The rest is held flat:** local materials and labour, which this indicator cannot see.
- **Outlook:** the next 3 and 6 months are simulated by redrawing past months of oil and currency
  moves in 3-month blocks.
- **How well it tracks:** over 3-month windows, its correlation with the official indices is
  0.34–0.37 in Uganda (0.45–0.58 with diesel) and 0.26 in South Africa. Use it as a gauge of
  imported cost pressure, not as a price forecast.
- **Official readings:** Ghana, Zimbabwe, Senegal and Mauritius also show their latest official
  reading (with source) from their `config.yaml`.

## 5. How a forecast is checked before it is trusted

Every model is backtested **walk-forward**: refitted at each past month using only data
available then, its forecasts compared with what actually happened.

| Check | Rule |
|---|---|
| Accuracy | Error compared with a simple trend, with no change, and with a direct model of the headline. Kept only if it beats them |
| Significance | Diebold–Mariano test against the trend. Reported, and does not need to be significant to be used |
| Ranges | 80% ranges must cover about 80% of past outcomes; widened if not |
| New drivers | A driver is added only if the backtest improves. Rainfall and public spending passed (−1.2% error, better in 27 of 36 cases). Blanket July/January calendar effects failed and were left out |
| Stability | How much each driver's effect changes over time; unstable effects are kept small |
| No look-ahead | Tests confirm that changing future data does not change a past fit |

Current Uganda results: the overall index error is 0.86–0.89 of the trend benchmark at 1–12 months.
Given the actual macro path, it would fall to 0.73 at 12 months, which shows that most remaining
error comes from forecasting the economy itself. Details: `countries/uganda/outputs/forecast/`.

## 6. What happens each week and each month

| When | Job (`src/market/cycle.py`) | What happens |
|---|---|---|
| **Every 3 hours** | `cycle.py refresh` | Latest oil and exchange rates → every country's forecast and 12-month path → public site (`index.html`, country pages, The Cost Call) |
| **Every Monday, 05:00** | `cycle.py weekly` | Refresh Brent, the 18 exchange rates, the IMF history and rainfall → refit each country's model at its latest official release, fixed to everything observed since → write 18 notes |
| **Every day, 06:30** | `cycle.py daily` | Check UBOS, KNBS and Stats SA for new releases → settle contracts whose official figure appeared → on a new UBOS release, re-run the backtest (which recalibrates the ranges) and the forecast → open the next contracts |
| **Each June** | By hand | Add the new budget's tax measures to `countries/uganda/policy_events.yaml`, with sources |
| **When an office publishes** | By hand, for countries without an adapter | Update `official_reading` in that country's `config.yaml` |

## 7. What comes out

- **Weekly note per country** (`countries/<country>/notes/weekly_<country>_<date>.md`/`.html`), with:
  - this week's drivers,
  - the expected change with its range ("with new data" vs "without"),
  - the latest official reading,
  - participants' prices and the open contracts,
  - method and sources.
  A contractor applies the expected % to their own latest quote for the same item.
- **Public site** (`public/`): every country's 12-month path powers the **Forecast to** picker. The next 8 weeks are
  interpolated from the monthly path (refreshed every 3 hours with the latest oil and exchange rates), then months;
  the bid calculator averages the same paths over a contract's months.
- **Forecast page in the app** (`/forecast`): the same numbers as the note, from
  `countries/<country>/outputs/forecast_latest.json`, with a range chart per row.
- **Forecast tables:** `countries/uganda/outputs/forecast/`: forecast paths for every scenario, each
  component's contribution, coefficients, backtest results, range calibration, stability.
- **Contract opening prices.** Each contract opens at the forecast's probabilities, using whichever
  method scored best for that contract in testing (structural, nowcast or a blend). The choice is
  recorded in `config.yaml` as `opening`. Participants then move the prices; the gap between crowd
  and model is the new information.

## 8. Scenarios

| Scenario | Assumption |
|---|---|
| baseline | Drivers follow the VAR; observed months fixed; tax measures at 50% pass-through |
| oil_reverses | Brent falls 35% over 6 months |
| oil_spike | Brent rises 30% over 3 months |
| shilling_weakens_10 | Shilling 10% weaker over 6 months |
| supply_chain_stress | Global supply-chain pressure +2 for 6 months |
| replay_2022 | The 2022 shock's macro moves, replayed month by month |
| policy_full / policy_no_pass_through | Tax measures passed on in full / not at all |

## 9. Limits to state whenever forecasts are shared

- Forecasts are estimates with ranges, not certainties; quote the range.
- Uganda's official data stops at April 2026 (UBOS has not published since); weekly readings bridge
  the gap, but May–September prints, when they come, are the real out-of-sample test.
- Kenya's model rests on about 12 test quarters; South Africa's on 43 test months.
- The cost-pressure outlook sees only imported costs, not local materials or labour.
- Tax pass-through is assumed (50%), and the July 2026 cement excise figure is unverified.
- Participants' prices are shown but never used to settle contracts.

## 10. Commands

```bash
python src/forecast/run_forecast.py structure     # Uganda: rebuild the index from its weights
python src/forecast/run_forecast.py backtest      # Uganda: walk-forward test + range calibration
python src/forecast/run_forecast.py forecast      # Uganda: 18-month paths, all scenarios
python src/forecast/run_forecast.py stability     # Uganda: do driver effects drift over time?
python src/market/run_market.py backtest --country kenya        # contract opening-price test
python src/market/run_market.py compare-opening                 # Uganda: structural vs nowcast vs blend
python src/forecast/weekly_note.py --country all                # all 18 weekly notes
python src/market/cycle.py weekly                               # everything the Monday job does
```

**Adding a driver:** add it to `countries/uganda/forecast_model.yaml`, run `backtest` and keep it only
if the error falls. **Adding a country:** see `docs/COUNTRIES.md`.
