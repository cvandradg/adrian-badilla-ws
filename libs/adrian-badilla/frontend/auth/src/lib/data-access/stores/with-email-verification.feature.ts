import { signalStoreFeature, withMethods, withProps } from "@ngrx/signals";
import { withCustomCallState } from "./with-custom-call-state.feature";
import { FirebaseAuthService } from "@adrian-badilla/ui/shared";
import { inject } from "@angular/core";

export function withEmailVerificationResources() {
  return signalStoreFeature(
    withCustomCallState("emailVerification"),
    withProps(() => ({
      firebaseAuthService: inject(FirebaseAuthService),
    })),

withMethods(() => ({
  testLog() {
    console.log('Signal Feature Store funcionando! 🎉', {
    });
  },
}))

  );
}
