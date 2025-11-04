import { Directive, inject } from '@angular/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';

import {
  faClipboardQuestion,
  faRightToBracket,
  faEnvelopeCircleCheck,
} from '@fortawesome/pro-light-svg-icons';

import { faGripLines } from '@fortawesome/pro-thin-svg-icons';

import {
  faPlus,
  faBolt,
  faDrumstick,
  faBowlRice,
  faPeanuts,
} from '@fortawesome/sharp-solid-svg-icons';

import {
  faArrowRight,
  faXmark as faXmarkSolid,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import {
  faGoogle,
  faTwitter,
  faFacebookF,
  faInstagram,
  faWhatsappSquare
} from '@fortawesome/free-brands-svg-icons';

import {
  faSpinnerThird,
  faUser,
  faCircleNotch,
  faMessageExclamation,
  faBars,
  faRotateBack,
  faPotFood,
  faSalad,
  faDumbbell,
  faCommentsQuestionCheck,
  faShirt,
  faTelescope,
  faHeartPulse,
  faPersonDollyEmpty,
} from '@fortawesome/pro-solid-svg-icons';
import { faHouseTree } from '@fortawesome/pro-regular-svg-icons';

@Directive()
export class Fontawesome {
  private readonly library = inject(FaIconLibrary);
  constructor() {
    this.library?.addIcons(
      faBolt,
      faPlus,
      faUser,
      faBars,
      faSalad,
      faCheck,
      faShirt,
      faGoogle,
      // faFilePen,
      faPeanuts,
      faPotFood,
      faTwitter,
      faDumbbell,
      faBowlRice,
      faGripLines,
      faDrumstick,
      faTelescope,
      faFacebookF,
      faHouseTree,
      faInstagram,
      // faCaretRight,
      faArrowRight,
      faXmarkSolid,
      faRotateBack,
      faHeartPulse,
      faCircleNotch,
      faSpinnerThird,
      faRightToBracket,
      faWhatsappSquare,
      faPersonDollyEmpty,
      faClipboardQuestion,
      faMessageExclamation,
      faEnvelopeCircleCheck,
      faCommentsQuestionCheck
    );
  }
}
