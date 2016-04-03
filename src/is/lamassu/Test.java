package is.lamassu.ssucard;

import javacard.framework.APDU;
import javacard.framework.ISO7816;
import javacard.security.KeyBuilder;
import javacard.security.KeyPair;
import javacard.security.ECPrivateKey;
import javacard.security.ECPublicKey;
import javacard.security.ECKey;
import javacard.security.Signature;
import javacardx.framework.util.ArrayLogic;

public class Test extends javacard.framework.Applet {
  private KeyPair keyPair;

  protected Test() {
    keyPair = new KeyPair(
        (ECPublicKey)KeyBuilder.buildKey(KeyBuilder.TYPE_EC_FP_PUBLIC, KeyBuilder.LENGTH_EC_FP_256, false),
        (ECPrivateKey)KeyBuilder.buildKey(KeyBuilder.TYPE_EC_FP_PRIVATE, KeyBuilder.LENGTH_EC_FP_256, false));
    Secp256k1.setCommonCurveParameters((ECKey)keyPair.getPrivate());
    Secp256k1.setCommonCurveParameters((ECKey)keyPair.getPublic());

    register();
  }

  public static void install(byte[] bArray, short bOffset, byte bLength) {
    new Test();
  }

  public void process(APDU apdu) {
    byte[] buffer = apdu.getBuffer();
    short lc = apdu.setIncomingAndReceive();

    ECPublicKey pubkey = (ECPublicKey)keyPair.getPublic();
    short pkl = pubkey.getW(buffer, (short)2);
    short[] pklArray = {pkl};

    short outLen = ArrayLogic.arrayCopyRepack(pklArray, (short)0, (short)1, buffer, (short)0);

    // sig.sign(...);
    apdu.setOutgoingAndSend((short)0, outLen);
  }

}
