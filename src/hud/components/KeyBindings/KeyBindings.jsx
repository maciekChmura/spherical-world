// @flow
import React from 'react';
import { connect } from 'react-redux';
import type { getElements } from '../../../../common/utils/flow';
import type { State } from '../../../reducers/rootReducer';
import { EVENT_CATEGORIES } from '../../../Input/eventTypes';
import Button from '../../uiElements/Button';
import Label from '../../uiElements/Label';
import ModalWindow from '../ModalWindow';
import {
  content,
  command,
  header,
  footer,
  section,
  commandGroup,
  helpLine,
  footerButtons,
  label,
  labelFirst,
  labelCommandGroup,
} from './keyBindings.scss';

type ActionMapppingProps = {|
  +caption: string;
  +gameEvent: string;
  +firstKey: string;
  +secondKey: string;
|};

type ActionCategoryProps = {|
  +name: getElements<typeof EVENT_CATEGORIES>,
  +items: $ReadOnlyArray<ActionMapppingProps>,
|}

type KeyBindingsProps = {|
  +keyCategories: $ReadOnlyArray<ActionCategoryProps>
|};

const ActionMappping = ({ caption, firstKey, secondKey }: ActionMapppingProps) => (
  <div className={command}>
    <Label text={caption} className={labelFirst} />
    <Button text={firstKey} size="small" />
    <Button text={secondKey} size="small" />
  </div>
);

const ActionCategory = ({ name, items }: ActionCategoryProps) => (
  <div>
    <article className={commandGroup}>
      <Label text={name} size="big" className={labelCommandGroup} />
    </article>
    { items.map(mapping => <ActionMappping key={mapping.gameEvent} {...mapping} />) }
  </div>
);

const KeyBindings = ({ keyCategories }: KeyBindingsProps) => (
  <ModalWindow caption="Key Bindings">
    <div className={content}>
      <header className={`${command} ${header}`}>
        <Label text="command" className={labelFirst} />
        <Label text="key 1" className={label} />
        <Label text="key 2" className={label} />
      </header>
      <section className={section}>
        <section>
          { keyCategories.map(category => <ActionCategory key={category.name} {...category} />) }
        </section>
      </section>
      <footer className={footer}>
        <div className={helpLine}>
          <Label text="press key to bind to command" size="small" className={labelCommandGroup} />
        </div>
        <div className={footerButtons}>
          <Button text="reset to default" size="small" />
          <Label text=" " className={label} />
          <Button text="unbind key" size="small" />
          <Button text="OK" size="small" />
          <Button text="Cancel" size="small" />
        </div>
      </footer>
    </div>
  </ModalWindow>
);

const mapState = ({ keyBindings: { keyCategories } }: State) => ({ keyCategories });

export default connect(mapState, null)(KeyBindings);
