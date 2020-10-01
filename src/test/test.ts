/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
/**
 * @fileoverview Unit tests for the Library.
 */

import 'mocha';

import {protos} from '@assistant/actions';
import {assert, expect} from 'chai';

import * as consts from '../consts';
import {ActionsOnGoogleTestManager} from '../index';

import * as mockResponse1 from './mock-response1.json';
import {EXAMPLE_CANVAS, EXAMPLE_CARD, EXAMPLE_COLLECTION, EXAMPLE_IMAGE, EXAMPLE_LIST, EXAMPLE_MEDIA, EXAMPLE_SUGGESTIONS, EXAMPLE_TABLE} from './test-data';

// tslint:disable:only-arrow-functions

describe('Library unit tests', function() {
  let test: ActionsOnGoogleTestManager;

  /** Updates the response's content part. */
  function updatedResponseContent(
      baseResponse: protos.google.actions.sdk.v2.ISendInteractionResponse,
      updatedContent: protos.google.actions.sdk.v2.conversation.IContent) {
    baseResponse!.output!.actionsBuilderPrompt = { content: updatedContent };
  }

  /** Initializes the latest turn response to the mock response. */
  function initLatestResponse() {
    test.latestResponse =
        test.deepClone<protos.google.actions.sdk.v2.ISendInteractionResponse>(
            mockResponse1 as
            protos.google.actions.sdk.v2.ISendInteractionResponse);
  }

  before('before all', function() {
    test = new ActionsOnGoogleTestManager();
    test.setupSuite('FAKE_PROJECT_ID');
  });

  it('Test defaults', async function() {
    const newLocale = 'en-US';
    const newSurface = 'PHONE';
    assert.deepEqual(
        test.getTestInteractionMergedDefaults(),
        consts.DEFAULT_INTERACTION_SETTING);
    const expectedDeviceProperties =
        consts.DEFAULT_INTERACTION_SETTING.deviceProperties;
    assert.deepOwnInclude(
        test.getTestInteractionMergedDefaults(),
        {'deviceProperties': expectedDeviceProperties});
    test.setSuiteLocale(newLocale);
    expectedDeviceProperties!.locale = newLocale;
    assert.deepOwnInclude(
        test.getTestInteractionMergedDefaults(),
        {deviceProperties: expectedDeviceProperties});
    expectedDeviceProperties!.surface = newSurface;
    test.setSuiteSurface(newSurface);
    assert.deepOwnInclude(
        test.getTestInteractionMergedDefaults(),
        {deviceProperties: expectedDeviceProperties});
  });

  // Test asserts and getters
  it('Test Speech', async function() {
    initLatestResponse();
    const expectedSpeech =
        'Welcome to Facts about Google! What type of facts would you like to hear?';
    assert.equal(test.getSpeech(), expectedSpeech);
    expect(() => test.assertSpeech(expectedSpeech)).not.to.throw();
    expect(() => test.assertSpeech(expectedSpeech, {
      isExact: true
    })).not.to.throw();
    expect(() => test.assertSpeech('Welcome')).not.to.throw();
    expect(() => test.assertSpeech(['Welcome to .* about Google!'], {
      isRegexp: true
    })).not.to.throw();
    expect(() => test.assertSpeech([
      'no match', 'Welcome to Facts about Google!'
    ])).not.to.throw();
    expect(() => test.assertSpeech('bad')).to.throw();
    expect(() => test.assertSpeech(['bad', 'bad2'])).to.throw();
    expect(() => test.assertSpeech(['bad .* about Google!', 'bad'], {
      isRegexp: true
    })).to.throw();
    expect(() => test.assertSpeech(['Welcome to Facts about Google!'], {
      isExact: true
    })).to.throw();
  });

  it('Test Text', async function() {
    initLatestResponse();
    const expectedText =
        'Welcome to Facts about Google! What type of facts would you like to hear?';
    assert.equal(test.getText(), expectedText);
    expect(() => test.assertText(expectedText)).not.to.throw();
    expect(() => test.assertText(expectedText, {isExact: true})).not.to.throw();
    expect(() => test.assertText('Welcome')).not.to.throw();
    expect(() => test.assertText(['Welcome to .* about Google!'], {
      isRegexp: true
    })).not.to.throw();
    expect(() => test.assertText([
      'no match', 'Welcome to Facts about Google!'
    ])).not.to.throw();
    expect(() => test.assertText('bad')).to.throw();
    expect(() => test.assertText(['bad', 'bad2'])).to.throw();
    expect(() => test.assertText(['bad .* about Google!', 'bad'], {
      isRegexp: true
    })).to.throw();
    expect(() => test.assertText(['Welcome to Facts about Google!'], {
      isExact: true
    })).to.throw();
  });

  it('Test Intent', async function() {
    initLatestResponse();
    assert.equal(test.getIntent(), 'actions.intent.MAIN');
    expect(() => test.assertIntent('actions.intent.MAIN')).not.to.throw();
    expect(() => test.assertIntent('BAD_INTENT')).to.throw();
  });

  it('Test Intent Parameter', async function() {
    initLatestResponse();
    assert.equal(test.getIntentParameter('intentParamString'), 'value');
    assert.equal(test.getIntentParameter('intentParamInt'), 5);
    assert.equal(test.getIntentParameter('badName'), null);
    expect(() => test.assertIntentParameter('intentParamString', 'value'))
        .not.to.throw();
    expect(() => test.assertIntentParameter('intentParamInt', 5))
        .not.to.throw();
    expect(() => test.assertIntentParameter('BadIntentParamName', 'blabla'))
        .to.throw();
    expect(() => test.assertIntentParameter('intentParamString', 'blabla'))
        .to.throw();
    expect(() => test.assertIntentParameter('intentParamInt', 101)).to.throw();
    expect(() => test.assertIntentParameter('intentParamInt', 'blabla'))
        .to.throw();
  });

  it('Test Scene', async function() {
    initLatestResponse();
    assert.equal(test.getScene(), 'Welcome');
    expect(() => test.assertScene('Welcome')).not.to.throw();
    expect(() => test.assertScene('BAD_SCENE_NAME')).to.throw();
  });

  it('Test Session Storage', async function() {
    initLatestResponse();
    assert.equal(test.getSessionParam('categoryType'), 'cats');
    expect(() => test.assertSessionParam('categoryType', 'cats'))
        .not.to.throw();
    expect(() => test.assertSessionParam('factsNumber', 1)).not.to.throw();
    expect(() => test.assertSessionParam('currentFactsData', {
      'title': 'Fact fake title'
    })).not.to.throw();
    expect(() => test.assertSessionParam('categoryType', 'bad')).to.throw();
    expect(() => test.assertSessionParam('factsNumber', 10)).to.throw();
    expect(() => test.assertSessionParam('missingKey', 'bad')).to.throw();
    expect(() => test.assertSessionParam('currentFactsData', {
      'title': 'Wrong title'
    })).to.throw();
    expect(() => test.assertSessionParam('currentFactsData', {
      'bad key': 'Wrong title'
    })).to.throw();
  });

  it('Test User Storage', async function() {
    initLatestResponse();
    assert.equal(test.getUserParam('userCategoryType'), 'cats');
    expect(() => test.assertUserParam('userCategoryType', 'cats'))
        .not.to.throw();
    expect(() => test.assertUserParam('userFactsNumber', 1)).not.to.throw();
    expect(() => test.assertUserParam('userCategoryType', 'bad')).to.throw();
    expect(() => test.assertUserParam('userFactsNumber', 10)).to.throw();
    expect(() => test.assertUserParam('missingKey', 'bad')).to.throw();
  });

  it('Test Home Storage', async function() {
    initLatestResponse();
    assert.equal(test.getHomeParam('homeStorageParam'), 'home param value');
    expect(() => test.assertHomeParam('homeStorageParam', 'home param value'))
        .not.to.throw();
    expect(() => test.assertHomeParam('homeStorageParam', 'bad')).to.throw();
    expect(() => test.assertHomeParam('missingKey', 'bad')).to.throw();
  });

  it('Test Get Content', async function() {
    initLatestResponse();
    const content = {card: EXAMPLE_CARD};
    updatedResponseContent(test.latestResponse!, content);
    assert.equal(test.getContent(), content);
  });

  it('Test Prompt', async function() {
    initLatestResponse();
    const prompt = {
      'firstSimple': {
        'speech':
            'Welcome to Facts about Google! What type of facts would you like to hear?',
        'text':
            'Welcome to Facts about Google! What type of facts would you like to hear?'
      },
      'suggestions': [{'title': 'Headquarters'}, {'title': 'History'}]
    };
    test.latestResponse!.output!.actionsBuilderPrompt = prompt;
    assert.equal(test.getPrompt(), prompt);
    expect(() => test.assertPrompt({
      'firstSimple': {
        'speech':
            'Welcome to Facts about Google! What type of facts would you like to hear?',
        'text':
            'Welcome to Facts about Google! What type of facts would you like to hear?'
      }
    })).not.to.throw();
    expect(() => test.assertPrompt(prompt)).not.to.throw();
    expect(() => test.assertPrompt(prompt, true)).not.to.throw();
  });

  it('Test Suggestions', async function() {
    initLatestResponse();
    assert.deepEqual(test.getSuggestions(), EXAMPLE_SUGGESTIONS);
    expect(() => test.assertSuggestions(EXAMPLE_SUGGESTIONS, true))
        .not.to.throw();
    expect(() => test.assertSuggestions(EXAMPLE_SUGGESTIONS)).not.to.throw();
    expect(() => test.assertSuggestions([{'title': 'Headquarters'}]))
        .to.throw();
  });

  it('Test Card', async function() {
    initLatestResponse();
    updatedResponseContent(test.latestResponse!, {card: EXAMPLE_CARD});
    assert.equal(test.getCard(), EXAMPLE_CARD);
    expect(() => test.assertCard(EXAMPLE_CARD)).not.to.throw();
    expect(() => test.assertCard(EXAMPLE_CARD, true)).not.to.throw();
    expect(() => test.assertCard({title: 'Card Title'})).not.to.throw();
    expect(() => test.assertCard({image: EXAMPLE_IMAGE})).not.to.throw();

    expect(() => test.assertCard({title: 'Card Title'}, true)).to.throw();
    expect(() => test.assertCard({title: 'Bad Card Title'})).to.throw();
  });

  it('Test Image', async function() {
    initLatestResponse();
    updatedResponseContent(test.latestResponse!, {image: EXAMPLE_IMAGE});
    assert.equal(test.getImage(), EXAMPLE_IMAGE);
    expect(() => test.assertImage(EXAMPLE_IMAGE!)).not.to.throw();
    expect(() => test.assertImage(EXAMPLE_IMAGE!, true)).not.to.throw();
    expect(() => test.assertImage({url: EXAMPLE_IMAGE!.url})).not.to.throw();

    expect(() => test.assertImage({url: EXAMPLE_IMAGE!.url}, true)).to.throw();
    expect(() => test.assertImage({url: 'Bad URL'})).to.throw();
  });

  it('Test List', async function() {
    initLatestResponse();
    updatedResponseContent(test.latestResponse!, {list: EXAMPLE_LIST});
    assert.equal(test.getList(), EXAMPLE_LIST);
    expect(() => test.assertList(EXAMPLE_LIST)).not.to.throw();
    expect(() => test.assertList(EXAMPLE_LIST, true)).not.to.throw();
    expect(() => test.assertList({title: EXAMPLE_LIST!.title})).not.to.throw();

    expect(() => test.assertList({title: EXAMPLE_LIST!.title}, true))
        .to.throw();
    expect(() => test.assertList({title: 'Bad List Title'})).to.throw();
  });

  it('Test Collection', async function() {
    initLatestResponse();
    updatedResponseContent(
        test.latestResponse!, {collection: EXAMPLE_COLLECTION});
    assert.equal(test.getCollection(), EXAMPLE_COLLECTION);
    expect(() => test.assertCollection(EXAMPLE_COLLECTION)).not.to.throw();
    expect(() => test.assertCollection(EXAMPLE_COLLECTION, true))
        .not.to.throw();
    expect(() => test.assertCollection({
      title: EXAMPLE_COLLECTION!.title
    })).not.to.throw();

    expect(
        () => test.assertCollection({title: EXAMPLE_COLLECTION!.title}, true))
        .to.throw();
    expect(() => test.assertCollection({
      title: 'Bad Collection Title'
    })).to.throw();
  });

  it('Test Table', async function() {
    initLatestResponse();
    updatedResponseContent(test.latestResponse!, {table: EXAMPLE_TABLE});
    assert.equal(test.getTable(), EXAMPLE_TABLE);
    expect(() => test.assertTable(EXAMPLE_TABLE)).not.to.throw();
    expect(() => test.assertTable(EXAMPLE_TABLE, true)).not.to.throw();
    expect(() => test.assertTable({
      title: EXAMPLE_TABLE!.title
    })).not.to.throw();

    expect(() => test.assertTable({title: EXAMPLE_TABLE!.title}, true))
        .to.throw();
    expect(() => test.assertTable({title: 'Bad Table Title'})).to.throw();
  });

  it('Test Media', async function() {
    initLatestResponse();
    updatedResponseContent(test.latestResponse!, {media: EXAMPLE_MEDIA});
    assert.equal(test.getMedia(), EXAMPLE_MEDIA);
    expect(() => test.assertMedia(EXAMPLE_MEDIA)).not.to.throw();
    expect(() => test.assertMedia(EXAMPLE_MEDIA, true)).not.to.throw();
    expect(() => test.assertMedia({
      mediaType: EXAMPLE_MEDIA!.mediaType
    })).not.to.throw();

    expect(() => test.assertMedia({mediaType: EXAMPLE_MEDIA!.mediaType}, true))
        .to.throw();
    expect(() => test.assertMedia({mediaType: 'MEDIA_STATUS_ACK'})).to.throw();
  });

  it('Test Canvas Data', async function() {
    initLatestResponse();
    test.latestResponse!.output!.canvas = EXAMPLE_CANVAS;
    assert.equal(test.getCanvasData(), EXAMPLE_CANVAS!.data!);
    expect(() => test.assertCanvasData(EXAMPLE_CANVAS!.data!)).not.to.throw();
    expect(() => test.assertCanvasData(EXAMPLE_CANVAS!.data!, true))
        .not.to.throw();
    expect(() => test.assertCanvasData([
      {elem1Key1: 'value'}, {}
    ])).not.to.throw();
    expect(() => test.assertCanvasData([
      {elem1Key1: 'value'}, {elem2Key1: 'value2'}
    ])).not.to.throw();

    expect(() => test.assertCanvasData([{elem1Key1: 'value'}], true))
        .to.throw();
    expect(() => test.assertCanvasData([
      {elem1Key1: 'bad value'}, {elem2Key1: 'value2'}
    ])).to.throw();
    expect(() => test.assertCanvasData([{'wrong': 'Bad value'}])).to.throw();
  });

  it('Test Canvas URL', async function() {
    initLatestResponse();
    test.latestResponse!.output!.canvas = EXAMPLE_CANVAS;
    expect(() => test.assertCanvasURL(EXAMPLE_CANVAS!.url)).not.to.throw();
    assert.equal(test.getCanvasURL(), EXAMPLE_CANVAS!.url);
    expect(() => test.assertCanvasURL(EXAMPLE_CANVAS!.url!)).not.to.throw();
    expect(() => test.assertCanvasURL('bad_url')).to.throw();
  });

  it('Test Conversion Not Ended', async function() {
    initLatestResponse();
    assert.equal(test.getIsConversationEnded(), false);
    expect(() => test.assertConversationNotEnded()).not.to.throw();
    expect(() => test.assertConversationEnded()).to.throw();
  });

  it('Test Conversion Ended', async function() {
    initLatestResponse();
    test.latestResponse!.diagnostics!.actionsBuilderEvents!.slice(-1)[0]!
        .endConversation = true;
    assert.equal(test.getIsConversationEnded(), true);
    expect(() => test.assertConversationEnded()).not.to.throw();
    expect(() => test.assertConversationNotEnded()).to.throw();
  });
});