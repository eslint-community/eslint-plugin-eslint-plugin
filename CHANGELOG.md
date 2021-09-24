# Changelog

## v3.6.1 (2021-09-24)

* Fix: Change autofix to suggestion in `require-meta-schema` rule ([#185](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/185)) ([afc1514](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/afc15149779647265b23ba8c4c181376eeb58795))
* Fix: only autofix in require-meta-schema rule when no options present ([#184](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/184)) ([d2d165d](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/d2d165dd70686f77a7204f9e4bf7a048a5e42942))

## v3.6.0 (2021-09-24)

* New: Add `requireSchemaPropertyWhenOptionless` option to `require-meta-schema` rule ([#180](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/180)) ([483f78f](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/483f78fb69f074189b78916efa8bf89f084f2f8a))
* Fix: Remove erroneous schema from require-meta-schema rule ([#178](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/178)) ([2f9b2b0](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/2f9b2b0671ebbcd3e76cf746d83371b131e375ac))
* Test: Add CI test for ESLint 6 compatibility ([#174](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/174)) ([30bb8e2](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/30bb8e2231c79f5010cf53763482edc70ffb4507))

## v3.5.3 (2021-07-30)

* Fix: False negative in `prefer-message-ids` rule ([#173](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/173)) ([c5c4b62](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/c5c4b62be720768aeb13c55b003566d2c38211cb))

## v3.5.2 (2021-07-29)

* Fix: support eslint v6 ([#172](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/172)) ([f7384ad](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/f7384ad76a0511cde29444256e16e9d273384cb0))

## v3.5.1 (2021-07-27)

* Fix: Fix false positive with empty array variable in `require-meta-has-suggestions` rule ([#171](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/171)) ([fffa881](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/fffa881fdaf1575834832e0e16df2cddb913008c))

## v3.5.0 (2021-07-27)

* Update: Add `catchNoFixerButFixableProperty` option (default false) to catch non-fixable rules that enable the fixable property in `require-meta-fixable` rule ([#165](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/165)) ([da652aa](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/da652aa2c13f55627503067968cc843a4732eb26))
* New: Add new rule `prefer-message-ids` ([#170](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/170)) ([95021dd](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/95021dd03baefe8f06d959d45fefd23c893fa832))

## v3.4.0 (2021-07-12)

* Fix: Ensure `require-meta-*` rules test null/undefined property values ([#164](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/164)) ([990f8f6](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/990f8f6ab1bb7bf60939e2455ea3fae086bb90ae))
* Chore: Improve test coverage in a few places ([#167](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/167)) ([cb9276e](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/cb9276e8a6490bb7023d5a6cb9fc4be5971341cf))
* Docs: Improve consistency of `require-meta-*` rule violation messages ([#166](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/166)) ([1da1acc](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/1da1acc3a0193087947b803f9f1a6233362511af))
* Update: Add autofixer to `require-meta-has-suggestions` rule ([#168](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/168)) ([a0a39c6](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/a0a39c6bc33b74b1f399a9099f98248c0c6d9577))
* Docs: Fix incorrect CLI option link ([#169](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/169)) ([639da89](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/639da89998bc30e68ee5bfe8c8a00671fead5c99))
* Fix: Improve detection of static `url` strings in `require-meta-docs-url` rule ([#162](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/162)) ([0459f12](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/0459f1288cda0174ec4622862d3e6d60eaff3889))
* Update: Fix false positives/negatives in `require-meta-fixable` rule ([#158](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/158)) ([dc29b03](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/dc29b03e4fa75827b2b009e29b9836c801f5f9f0))
* Docs: Fix typo ([#160](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/160)) ([88cb2bf](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/88cb2bf11e5f8162b19934f7152a1a2adaef8f27))
* Fix: Avoid crash with non-static value of `hasSuggestions` in `require-meta-has-suggestions` rule ([#163](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/163)) ([5c83cd9](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/5c83cd9d0b49adfc408936511b560f957d3cbbcb))
* Chore: Fully adopt `messageId` in `require-meta-docs-description` rule ([#161](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/161)) ([b0b170e](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/b0b170e11c7d86bfb34a3412edacedaed35268ab))
* Docs: Update rule descriptions for consistency ([#159](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/159)) ([c10afb8](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/c10afb833c294195e83af4d018c7bf425379fc13))
* Fix: Use token utilities from eslint-utils ([#156](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/156)) ([5ac45f0](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/5ac45f08bb943c097d3d10ee088a4a8f4f8e4de8))
* Fix: Fix false negatives and reporting location in `require-meta-type` ([#155](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/155)) ([7c0d1d0](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/7c0d1d06050d3e68de7623a81d4022886ae457a6))
* Chore: remove unnecessary ignore pattern from internal js linting ([#154](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/154)) ([4aa9aca](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/4aa9aca1dc27e224bb55fb6f1d5bdb565c73c6a1))

## v3.3.0 (2021-07-02)

* Chore: improve test coverage of `no-identical-tests` rule ([#153](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/153)) ([281d4e5](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/281d4e58d48fc5fad6ba033df9d412cfcb8ed99c))
* Docs: ensure rule doc titles match rule descriptions ([#147](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/147)) ([c55a956](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/c55a95616dd2e1e832fb082c4e686f4dc271d931))
* Update: add the plugin name to plugins prop of presets ([#91](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/91)) ([e825c56](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/e825c5692361da151e75b69b9dca196d30b6d465))
* Docs: indicate rules with suggestions ([#146](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/146)) ([cd65a5c](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/cd65a5cedc9adc5874b789ccfffe2ac2c2041abb))
* New: add new rule `no-only-tests` ([#145](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/145)) ([f0ac31c](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/f0ac31c967eb05dd5da95e5ef15c26ce48f6d976))
* Fix: update fixer-return rule to handle arrow function expressions ([#144](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/144)) ([6762a3f](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/6762a3fa61fde2e9ae43576bd695d31da7ab5736))

## v3.2.0 (2021-06-23)

* Fix: Improve detection of fix functions that never return a fix in `fixer-return` rule ([#143](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/143)) ([65cfb2c](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/65cfb2cd78484f2072bb1f150d07c6fa299579ed))
* Chore: enforce minimum code coverage ([#142](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/142)) ([f136e4c](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/f136e4ce5917730bbb175e159e26af737aa76523))
* Chore: enable meta-property-ordering rule internally ([#139](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/139)) ([6c83ec6](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/6c83ec65fa3c8c5a1771ab2c5bcb1946a0c1d78f))
* Update: Flag a violation when rule options are used but an empty schema is present in `require-meta-schema` rule ([#138](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/138)) ([6ffddd7](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/6ffddd703773be7d2afd5e33fc2529b836b7a56c))
* Docs: add rule documentation consistency tests ([#137](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/137)) ([c7f8bee](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/c7f8beedfc9c4df64660b1d25ed0498f8551dfcf))
* Docs: add eslint-plugin-markdown for JavaScript code samples in documentation ([#134](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/134)) ([15ffada](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/15ffadae375f9f835b3f3a18b5aa1bbc07e5efbe))
* Chore: add eslint-plugin-unicorn ([#133](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/133)) ([d71c8b3](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/d71c8b3833e8bbde01236396b40c91f0dc11531f))
* Build: Add `markdownlint` for doc formatting ([#130](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/130)) ([5b0ce68](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/5b0ce688d3f423aaecb704a3e29239097599c0dd))
* Build: run tests under Node 16 ([#132](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/132)) ([1368388](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/136838824c3b0ad81710034e13761af53b3e7525))
* Fix: improve detection of static arguments of context.report() in several rules ([#129](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/129)) ([6d5be9f](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/6d5be9fb3e2e4c4c19d0c20a8f4a33867573e3fa))

## v3.1.0 (2021-06-15)

* Chore: Switch from `.eslintrc.yml` to `.eslintrc.js` ([#127](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/127)) ([c767ea3](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/c767ea33a69a35a0cb7007b90f41c38c5877e94f))
* Docs: clarify some wording in `require-meta-docs-url` rule doc ([#126](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/126)) ([6fab4c2](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/6fab4c21cc961a349f68fd17f83ca5d8ef6d7123))
* Docs: elaborate on output assertion requirement and benefits in `consistent-output` rule doc ([#123](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/123)) ([2fe92b7](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/2fe92b70fe2282e480a029471e2ba43f5c3cbc8f))
* Docs: add explanation to `prefer-output-null` rule doc ([#124](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/124)) ([72fc89d](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/72fc89d3c212551f96f13f85b9720a6096975d3c))
* Docs: fix --fix link ([#125](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/125)) ([ac2259c](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/ac2259cb622326e34a4ec3f317aa3ad8bf8fe0e7))
* Docs: add links for deprecated and new styles in `prefer-object-rule` rule ([#122](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/122)) ([6e351c6](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/6e351c6563b22157510dd9c772d2b98c468d856e))
* Docs: mention allowed values in require-meta-type rule doc ([#121](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/121)) ([63d46e2](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/63d46e2f450c3517d95ca0c41d934aa345bedcd2))
* New: add new rule require-meta-has-suggestions ([#105](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/105)) ([ff0ae38](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/ff0ae38e95d79ff316d77dbc5fd41b7d27c45bb0))
* Docs: fix broken links in changelog ([b6ce109](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/b6ce109f42e4b7f42d6c1b7f6ac54b24d7fec54c))

## v3.0.3 (2021-05-10)

* Docs: rm global-installed usage ([#116](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/116)) ([1f99c7c](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/1f99c7ce827f576ffba8a76fc8d2bee534648f8a))
* Docs: update CI badge for github actions in README ([#115](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/115)) ([ccac2c2](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/ccac2c2e8b21b18f46f2f409ce9c66f302bbee19))
* Docs: add npm badge to README ([#114](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/114)) ([36d16df](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/36d16dfc1d408dfcb3ddd0dfbf02007d1c1fb98c))
* Fix: Improve detection of static `description` strings and ignore non-static descriptions in `require-meta-docs-description` rule ([#113](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/113)) ([1840a53](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/1840a53d98fd602feae20219d37510ecbe30fd74))
* Chore: refactor `utils.getRuleInfo` ([#112](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/112)) ([98e893b](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/98e893b941ab1e41931a17d141723547a0cad659))

## v3.0.2 (2021-04-16)

* Fix: `require-meta-schema`: Fix false positive ([#111](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/111)) ([9f4f461](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/9f4f461969b0f89d40219198423b39eea7b63d1e))

## v3.0.1 (2021-04-15)

* chore: fix failing tests ([e6aa71f](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/e6aa71f8b018c109ab86ca887f70b253a3e312a3))
* Fix: Rule can't find reference of `create` function ([#107](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/107)) ([eb501fc](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/eb501fc57efa602d2d57769e4d09cda2b24b53bf))
* Chore: Switch `escope` to `eslint-scope` ([#109](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/109)) ([8eccc37](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/8eccc371ef425e19eb0c3ab30becc698dbea7fe3))
* Build: Switch to github actions ([#108](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/108)) ([31951d4](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/31951d4127f2b49cda7400a41629c05091a1ea9d))

## v3.0.0 (2021-04-08)

* Breaking: change test-case-property-ordering default options (fixes [#79](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/79)) ([#93](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/93)) ([ffb734b](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/ffb734b5915fbb0087c7aac8791a875f2c4b49e5))
* Breaking: drop eslint < 7 & node.js < 10 ([#95](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/95)) ([59ddffc](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/59ddffcd0c4f1e293883838264daa7a29da04db7))
* Docs: Grammar in `require-meta-schema.md` ([#103](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/103)) ([a3017e2](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/a3017e253db08630da3f92428df6f4f2680ecf12))

## v2.3.0 (2020-06-23)

* New: Add rule `prefer-object-rule` ([#101](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/101)) ([7f625f4](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/7f625f425332fc8028cbba38b8d4b93f0849dd62))

## v2.2.2 (2020-06-10)

* Fix: handle spreads in rule meta objects ([#100](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/100)) ([45a09a6](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/45a09a67942c55230fcae893633c1911b089a514))
* Docs: Fix incorrect rule reference in meta-property-ordering ([#96](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/96)) ([68059b1](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/68059b1ed2cb2710a4d6c4aa1d05afad8de565f0))
* Upgrade: eslint and other deps ([#92](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/92)) ([93d082c](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/93d082cce48da79bf7305df70e4fd0061b482e88))

## v2.2.1 (2020-01-17)

* Fix: update `require-meta-schema` rule to allow object schemas (in addition to array schemas) ([#90](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/90)) ([e582cb6](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/e582cb61d0f51c15a8e5d9e38c82d1c73f2d6edd))

## v2.2.0 (2020-01-08)

* Update: Add new rule `require-meta-docs-description` ([#89](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/89)) ([b175b46](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/b175b46732033c99e26e5380d83ea94727c15218))
* New: add `always` option to `consistent-output` rule ([#88](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/88)) ([8c74f24](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/8c74f242431de0d809f7be2801d4d889340fe84e))
* New: add new rule `require-meta-schema` ([#87](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/87)) ([10b28f0](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/10b28f03d12a4770db3433b3b9cedface0d480d4))
* Fix: Check for meta type even when using a function reference ([#84](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/84)) ([38ad521](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/38ad521963b4e10d001ef91314a637c1028972cf))
* Chore: fix incorrect test cases. ([#82](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/82)) ([c86c224](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/c86c22453bc9cb9aad536985f4361c7c9d3de096))

## v2.1.0 (2019-05-08)

* New: meta-property-ordering (fixes [#62](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/62)) ([#80](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/80)) ([aebf1cf](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/aebf1cf2023e014aa8778fe457bfa5c8a4c876fc))
* Revert "Update: add plugins: ['eslint-plugin'] in configs" ([#76](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/76)) ([9bab974](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/9bab97423656bb40a4cd199034c5a167e89b822e))
* Update: add plugins: ['eslint-plugin'] in configs ([bb71efa](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/bb71efaec765691c1cb85bd6d8d6b46a5ae0c960))

## v2.0.1 (2018-12-22)

* Fix: allow to use generator function as fix in fixer-return ([#75](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/75)) ([7556633](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/7556633ce349ec78a90fe7986d6090726e84c048))
* Fix: require-meta-type crash when has no meta property ([#73](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/73)) ([bc9b1a0](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/bc9b1a01cc3fcc9d115615c7e107f08c6bb0538c))

## v2.0.0 (2018-12-08)

* New: require-meta-type (fixes [#67](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/67)) ([#68](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/68)) ([7f87941](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/7f8794159aae178fdd6f069ed9d4dee27367633a))
* Update: ensure report-message-format checks formatting in meta.messages ([#72](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/72)) ([1ffb48a](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/1ffb48aec79c278562729698bff93493ee5ac20e))
* Upgrade: dev dependencies to latest ([#69](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/69)) ([9dad54f](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/9dad54f6b3e148068f6322011f4c5c63bd4178c0))
* Breaking: require node >= 6 & eslint >= 5 (fixes [#70](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/70)) ([#71](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/71)) ([c1778af](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/c1778af090dc88f122101e3cf6ea653b5bc49778))

## v1.4.1 (2018-10-24)

* Fix: no-deprecated-report-api should consider spread operator(fixes [#64](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/64)) ([#65](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/65)) ([ec7a34c](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/ec7a34c562123b78494a256c3f233fc0ff759e50))
* Chore: fix linting errors ([#66](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/66)) ([a128650](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/a12865059fb625a8c2fc123d81d636d825d3d9d8))

## v1.4.0 (2018-01-27)

* New: require-meta-docs-url (fixes [#55](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/55)) ([#56](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/56)) ([114d2c7](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/114d2c7aa1539d2271069ab54863bd3825fb7ec0))

## v1.3.0 (2018-01-08)

* Update: add meta.docs.url to rules ([eb207d0](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/eb207d0ef650e9f91f7f7ca3be2ab8cbe762f0d3))
* Docs: fix some errors in rule example. ([#52](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/52)) ([bd97347](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/bd9734768d0da32806f9c2bae6f0327f7f8427b3))
* Docs: fix prefer-replace-text doc name. ([#51](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/51)) ([786fc92](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/786fc92aa9d02c3a5cb75a7ca8417b5b7017b8d5))
* New: rule prefer-replace-text ([#50](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/50)) ([f0d27d5](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/f0d27d50f0b2d89bd3c38f9ffa02a8b8210f083d))
* Docs: http => https. ([#49](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/49)) ([86d3ebf](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/86d3ebfe80f6021bfac826b49f7c975542a64b70))
* Chore: add vscode to gitignore. ([#48](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/48)) ([0f64dc1](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/0f64dc15368c3d558d4d304c95f3fadccff4c456))
* Build: autogenerate the table in README.md (fixes [#43](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/43)) ([#46](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/46)) ([efae7da](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/efae7daaeecc96545aac3714c043e4b564aa0edd))
* Update: add --fix to prefer-output-null. ([#44](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/44)) ([0fc99af](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/0fc99af38a5217b698a0cff6c391496ecf2720aa))
* Docs: add no-deprecated-context-methods fixable. ([#45](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/45)) ([cf563fb](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/cf563fb48d1376ebf9031daa80f6c520ce80b893))
* Docs: add missing fixable icon to `no-deprecated-context-methods` ([#42](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/42)) ([3597af5](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/3597af584d02a4805516ff766e8deb62456301f6))

## v1.2.0 (2017-09-10)

* New: no-deprecated-context-methods rule (fixes [#40](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/40)) ([#41](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/41)) ([8931504](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/8931504a891dd95ccc60d3e75e93826cc5f56091))

## v1.1.0 (2017-09-08)

* Chore: add release script ([#39](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/39)) ([3454d60](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/3454d604bb98a4f06ffd32c2a70e183426b20c39))
* Update: utils.getTestInfo filter elements equal to null (fixes [#37](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/37)). ([#38](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/38)) ([7b33446](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/7b33446cd90c9f928618b59f6da1b9e05a8ea34f))

## v1.0.0 (2017-08-31)

* Fix: some rules crashing if tests array has missing elements (fixes [#35](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/35)). ([#36](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/36)) ([e3a14e1](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/e3a14e11d86836b1ab63d19c689327fea8f8a4bc))
* Breaking: update ESLint peerDependency to >=4.1.0 ([#33](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/33)) ([7cabcdc](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/7cabcdcae32ae67fc3769804aad5e5d8882b3baa))
* Chore: use local variable. ([#34](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/34)) ([e04a4bc](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/e04a4bc15963efdff6309549e34c51cfa2c2ea74))
* Update: add autofixing to test-case-property-ordering. (fixes [#31](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/31)) ([#32](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/32)) ([23f9010](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/23f90106a5c8b3cf1a785989d6c9ec798da339a9))

## v0.8.0 (2017-07-26)

* Breaking: add no-unused-placeholders to recommended. ([#29](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/29)) ([882c36a](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/882c36a075be72b136e75eef14b13f09cf3fc27b))
* Docs: fix rulename in example. ([#28](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/28)) ([6a9fb15](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/6a9fb15a34efb72691a8aa79ba23efc5f3e1f255))
* New: rule no-unused-placeholders. ([#26](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/26)) ([a090610](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/a090610265260d681dcf55f45b16252d957ec262))
* Chore: use utils.getReportInfo ([#27](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/27)) ([c9b07ce](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/c9b07ce9c4637ec03280ece8fe9aef16a7528ac0))
* Breaking: add some rules to recommended config ([#25](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/25)) ([8ac484c](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/8ac484c68e7314d6977855c1901541f6a3f5dc20))
* Update: no-identical-tests despite of properties order. ([#21](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/21)) ([223da80](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/223da80bd918d02bc1038434c382e13303deb6fe))
* New: rule test-case-property-ordering ([#16](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/16)) ([6137274](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/6137274a28a5b3036bc41933d96222ab6ed1c6a0))
* Chore: upgrade deps. ([#24](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/24)) ([b30c176](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/b30c17630da23c885f4c49d25da1da0289610737))
* Fix: linting errors. ([#23](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/23)) ([8d8526f](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/8d8526fe02ea5704469fb07df53970bcfdfeaec2))
* Fix: prefer-output-null crashes, when a test case is not object. ([#22](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/22)) ([7c7c772](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/7c7c772f2cb1850eaf364d69a29e49f9c954479a))
* New: fixer-return ([#15](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/15)) ([93bd142](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/93bd142cbf6159561099ad5e3cdfd8f1f90503f5))
* New: rule prefer-output-null ([#20](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/20)) ([9f98ac4](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/9f98ac45c6bbeb5b1be894e646d43dabf86befae))
* Docs: rules to be alphabetical. ([#18](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/18)) ([4cec353](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/4cec353c272d6dd799ba3c30cd4f06b103b0c7e8))
* Chore: upgrade eslint-config-not-an-aardvark@2.1.0 ([e079baf](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/e079baf5e33a4045162969a7490cb1e869963bf0))
* Update: add --fix to no-identical-tests. ([#13](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/13)) ([ca607c4](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/ca607c43aba3101cf68ed79a2c58636cbc96cfb3))
* Chore: disable package-lock.json ([#14](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/14)) ([b41a2b8](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/b41a2b86ea4e405080089cd9def20c9a0a027e36))
* Upgrade: eslint-plugin-self@1.0.1 ([3fc9cc3](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/3fc9cc3d72aff315341f916f09b753bfa4aa5350))

## v0.7.4 (2017-07-01)

* New: no-identical-tests rule ([#11](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/11)) ([8c19ab5](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/8c19ab5eb8942e35f102ca300a83ac73f67ce26f))

## v0.7.3 (2017-07-01)

* Update: support ESLint v4 ([e361d63](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/e361d63753092178edbdde36dbdbf5cc96b7817c))
* Chore: add Node 8 to travis ([9ee1ad3](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/9ee1ad376fa0a6f211bbbea5880a3962103c708f))
* Chore: remove identical tests ([#12](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/12)) ([82c6892](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/82c6892d0a4f5eb3f8f508b04643447ac7ba03e9))
* Chore: use eslint-plugin-self (fixes [#10](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/10)) ([58a927a](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/58a927a9d7d7f699a2ae70619c7e102a8fcdc547))
* Upgrade: espree to 3.4.3 ([#9](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/9)) ([3dfc4c6](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/3dfc4c6ff8ff1141a7f6aea80f81f28fd0499a9d))

## v0.7.2 (2017-05-09)

* Docs: update readme to indicate test-case-shorthand-strings is fixable ([e480d08](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/e480d082087064b306a489d9b101d3398ff6af22))
* Update: add fixer for test-case-shorthand-strings ([9fcf4a6](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/9fcf4a6060804a30d215985c99944fb955ea8a95))
* Docs: add example to consistent-output with output: null ([e2e3de3](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/e2e3de320c7f3f051df56f65fe3bea4826a23a54))

## v0.7.1 (2017-02-22)

* Fix: incorrect category for consistent-output ([308b048](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/308b048140e65a2b3b39023df2ab9ea814e754b4))

## v0.7.0 (2017-02-22)

* New: consistent-output rule ([64ed898](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/64ed898ad504a507551f6ebcbcd88f1c34bea61a))
* Docs: add directive comment to no-useless-token-range docs ([667e36f](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/667e36f015efdd532678d008ea06bc1f9aacadf4))

## v0.6.0 (2017-02-22)

* Docs: add travis badge to README.md ([55388b2](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/55388b28acb926e517c7d1acb67ede66f0845316))
* Breaking: add no-useless-token-range to recommended config ([277d11c](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/277d11cb323130e0e3870894b145ff03a9f6bf10))
* New: no-useless-token-range rule ([4537737](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/45377379b76ba0ce869d1179eaf4afd5e1c5ee21))

## v0.5.0 (2017-02-01)

* New: prefer-placeholders rule ([de03394](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/de033940546a791a12b800adc46f9bc32b24fef2))
* Chore: unify logic for parsing context.report() arguments ([d14cd05](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/d14cd055adb282d7aacfcfcadee44b0bbb8b3d4a))
* New: add more presets ([2fa5e7f](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/2fa5e7fbc664d6eaff6ffcc2aa26b1436d0b442f))

## v0.4.0 (2017-02-01)

* Chore: remove errors from valid test case ([815bf07](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/815bf073f8086e98eb57b31f3a60c8dd07f4a13b))
* Chore: enable test-case-shorthand-strings on this codebase ([558f1db](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/558f1dbc0635809e410b24b2e8be45fe9aa9b8e4))
* Docs: Remove incorrect "recommended" marking for report-message-format ([48b7e34](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/48b7e347f8346bf66b8169ac0ec5d78e77d43cb1))
* New: test-case-shorthand-strings rule ([cbbc49f](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/cbbc49f52ab447df68f340282ef821a44800e280))

## v0.3.0 (2017-01-27)

* Breaking: add no-missing-placeholders to eslint-plugin:recommended ([833d094](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/833d094a2b4ee4a9460264979b5a7a61d7182595))
* New: no-missing-placeholders rule ([a995733](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/a995733b0f3a555d946f7e8818396d0983fa8cc8))

## v0.2.1 (2016-12-14)

* Fix: check the type of the first arg of the old context.report() API ([29dc51c](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/29dc51c81749dd66d6d6b1861f307d8bd6947b89))
* Docs: Add require-meta-fixable to the list of rules in the readme ([45dac85](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/45dac8544547980a751532877c012c53b5e9224b))

## v0.2.0 (2016-12-14)

* Chore: refactor utils.getRuleInfo ([5f8dbd8](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/5f8dbd8a9a6eb4084081aef6adb543463d83474b))
* Fix: report-message-format crash on reporting empty object ([f32ada6](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/f32ada66623eb54385afcbf4516931ad94de0336))
* Breaking: add require-meta-fixable to recommended config ([0a1e1fa](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/0a1e1fa0fb24fdb2099a689f2cf47fc5ba98d832))
* New: require-meta-fixable rule ([59bfdd6](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/59bfdd62929d1b611f226e6b321a76ea69017154))
* Chore: Prohibit small letters as the first character of report messages ([7a74a7b](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/7a74a7b46680a9cf58c4b96da40e1d1a6ae5bcba))
* Fix: incorrect no-deprecated-report-api autofix if > 5 arguments passed ([2bd6cba](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/2bd6cba9209ea46eddbc33063c005b2586b96bd4))
* Update: improve the error location for no-deprecated-report-api ([937bafa](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/937bafa7710adb8e11c6f581485b44d367097f5f))
* Fix: report-message-format crash when calling report() with no arguments ([292d141](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/292d141ef7ef949ac0e92deeb70b9d836b65935a))
* Update: improve the report location for report-message-format ([15f3192](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/15f31929f23e163924f1e217e064eeac23de5276))
* Chore: use string placeholders for the message in report-message-format ([b5a13f6](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/b5a13f6699ba652ca3d44d459cdfcda3f8800443))
* Chore: enable report-message-format for this plugin's rules ([ad60708](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/ad607080d02736aa9b9aa46969ddd99b2a474dc6))
* Build: ensure the .eslintrc.js file is linted when running tests ([7abbbf5](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/7abbbf5db745861751f4bc0ac2202bd1b84328f1))
* Build: Dogfood this plugin's rules on its own codebase ([e345dc5](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/e345dc5670b343ef8dd1800aa84c096633a6f879))
* Chore: refactor no-deprecated-report-api to use getContextIdentifiers ([1914f17](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/1914f17cb5170c632a15d5c7e9bdc9fb19fd109b))
* Chore: fix comment indentation in no-deprecated-report-api ([c64e3d8](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/c64e3d86af82592fcb3b95500463dc69f9dc90df))
* New: report-message-format rule ([ffab432](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/ffab432d1351a2a3f759efc2a922d28e3cabdf90))
* Chore: add npm-debug.log to .gitignore ([63415f8](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/63415f899adc2bbddf8c1b9e4c78a02a78a9eec9))

## v0.1.0 (2016-12-13)

* New: Add a 'recommended' config ([7b9ec01](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/7b9ec012286f4c16af27e79db7e449916c56c3c6))
* New: no-deprecated-report-api rule ([06a6e5a](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/06a6e5ae81328ba37e8360ca5ad7498939059031))
* New: initial commit ([8b0ae4f](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/commit/8b0ae4f30014e9526af02ecba518f5edfd38c2b9))


