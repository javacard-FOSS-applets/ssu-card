package is.lamassu.ssucard;

import javacard.framework.APDU;
import javacard.framework.ISO7816;
import javacard.framework.ISOException;
import javacard.security.KeyBuilder;
import javacard.security.KeyPair;
import javacard.security.ECPrivateKey;
import javacard.security.ECPublicKey;
import javacard.security.ECKey;
import javacard.security.Signature;
import javacard.security.CryptoException;
import javacard.security.MessageDigest;
import javacardx.crypto.Cipher;
import javacardx.framework.util.ArrayLogic;
import javacard.framework.JCSystem;

public class Test extends javacard.framework.Applet {
  private KeyPair keyPair;

  protected Test() {
    keyPair = new KeyPair(
        (ECPublicKey)KeyBuilder.buildKey(KeyBuilder.TYPE_EC_FP_PUBLIC, KeyBuilder.LENGTH_EC_FP_256, false),
        (ECPrivateKey)KeyBuilder.buildKey(KeyBuilder.TYPE_EC_FP_PRIVATE, KeyBuilder.LENGTH_EC_FP_256, false));
    Secp256k1.setCommonCurveParameters((ECKey)keyPair.getPrivate());
    Secp256k1.setCommonCurveParameters((ECKey)keyPair.getPublic());
    keyPair.genKeyPair();

    register();
  }

  public static void install(byte[] bArray, short bOffset, byte bLength) {
    new Test();
  }

  public void process(APDU apdu) {
    byte[] buffer = apdu.getBuffer();
    byte cla = buffer[ISO7816.OFFSET_CLA];
    short lc = apdu.setIncomingAndReceive();
    Signature sig;

    if (cla != (byte)0xb0) {
      ISOException.throwIt(ISO7816.SW_CLA_NOT_SUPPORTED);
    }

    short pkl;

    switch (buffer[ISO7816.OFFSET_INS]) {
      case INS_PUBKEY:
        ECPublicKey pubkey = (ECPublicKey)keyPair.getPublic();
        pkl = pubkey.getW(buffer, (short)0);
        apdu.setOutgoingAndSend((short)0, pkl);
        break;
      case INS_SIGN:
        sig = Signature.getInstance(Signature.ALG_ECDSA_SHA_256, false);
        ECPrivateKey privkey = (ECPrivateKey)keyPair.getPrivate();
        short hashLen = (short)buffer[ISO7816.OFFSET_LC];

        try {
          sig.init(privkey, Signature.MODE_SIGN);
          short rLen = sig.signPreComputedHash(buffer, (short)ISO7816.OFFSET_CDATA,
              hashLen, buffer, (short)0);
          apdu.setOutgoingAndSend((short)0, rLen);
        } catch (CryptoException e) {
          buffer[0] = 0x51;
          buffer[1] = (byte)e.getReason();
          buffer[2] = (byte)hashLen;
          apdu.setOutgoingAndSend((short)0, (short)3);
          return;
        } catch (Exception ee) {
          buffer[0] = 0x55;
          apdu.setOutgoingAndSend((short)0, (short)1);
          return;
        }
        break;
      default:
        ISOException.throwIt(ISO7816.SW_INS_NOT_SUPPORTED);
        break;
    }

  }
  private static final byte INS_PUBKEY = (byte)0x01;
  private static final byte INS_SIGN = (byte)0x02;
}
