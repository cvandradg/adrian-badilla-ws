import type { FirebaseError } from 'firebase/app';

function isFirebaseError(error: unknown): error is FirebaseError {
  return (
    !!error &&
    typeof error === 'object' &&
    (error as any).name === 'FirebaseError'
  );
}

export function mapFirebaseAuthErrorToMessage(error: unknown): string {
  const code = isFirebaseError(error) ? error.code : undefined;

  switch (code) {
    case 'auth/email-already-in-use':
      return 'El usuario ya existe.';
    case 'auth/expired-action-code':
      return 'El código ha expirado.';
    case 'auth/weak-password':
      return 'La contraseña es muy débil.';
    case 'auth/user-not-found':
      return 'No se encontró este usuario.';
    case 'auth/wrong-password':
      return 'La contraseña es incorrecta.';
    case 'auth/invalid-login-credentials':
      return 'Credenciales inválidos.';
    case 'auth/user-disabled':
      return 'El usuario está deshabilitado.';
    case 'auth/invalid-email':
      return 'El correo electrónico no es válido.';
    case 'auth/account-exists-with-different-credential':
      return 'Ese correo ya se encuentra en uso.';
    case 'auth/too-many-requests':
      return 'Espera unos minutos antes de volverlo a intentar.';
    case 'auth/operation-not-supported-in-this-environment':
      return 'En esta plataforma esta acción no es posible.';
    case 'auth/popup-blocked':
      return 'Tu buscador no permite abrir ventanas emergentes.';
    case 'auth/missing-continue-uri':
      return 'Problema con el URL, ponte en contacto con nosotros.';
    case 'auth/missing-ios-bundle-id':
      return 'Problema con iOS bundle id, ponte en contacto con nosotros.';
    case 'auth/invalid-continue-uri':
      return 'Problema con URL inválido, ponte en contacto con nosotros.';
    case 'auth/unauthorized-continue-uri':
      return 'Problema el dominio del URL, ponte en contacto con nosotros.';
    case 'auth/missing-android-pkg-name':
      return 'Problema con Android pkg name, ponte en contacto con nosotros.';
    case 'auth/missing-email':
      return "Escribe tu correo arriba y presiona de nuevo 'Recuperar Contraseña.'";
    case 'auth/invalid-action-code':
      return 'Este link ya no es válido, ponte en contacto con nosotros si crees que es un error.';
    case 'auth/cancelled-popup-request':
    case 'auth/popup-closed-by-user':
      return 'Se cerró la ventana, inténtalo de nuevo.';
    case 'auth/operation-not-allowed':
    case 'auth/auth-domain-config-required':
    case 'auth/unauthorized-domain':
      return 'Ocurrió un error, inténtalo de nuevo.';
    default:
      return 'Ocurrió un error, si continúa pasando contáctate con nosotros.';
  }
}
