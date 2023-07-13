import * as anchor from '@coral-xyz/anchor'
import { anchorProgram } from '@/util/helper';

export const createQuizAccount = async (
  wallet: anchor.Wallet,
  username: string,
  quizId: number,
) => {

  const program = anchorProgram(wallet);

  const [quizUserAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("quiz_user_account"), wallet.publicKey.toBuffer(), new anchor.BN(quizId).toArrayLike(Buffer, "le", 1)],
    program.programId
  );

  try {
    const txHash = await program.methods
      .initializeQuizUser(new anchor.BN(quizId), username)
      .accounts({
        quizUserAccount,
        signer: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    return { error: false, sig: txHash }

  } catch (e: any) {
    console.log(e)
    return { error: e.toString(), sig: null }
  }
}