import * as anchor from '@coral-xyz/anchor'
import { anchorProgram } from '@/util/helper';

export const answerQuestion = async (
    wallet: anchor.Wallet,
    answers: number[],
    quizId: number,
) => {

    const program = anchorProgram(wallet);

    const [quizAccount] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("quiz_account"), new anchor.BN(quizId).toArrayLike(Buffer, "le", 1)],
        program.programId
    );


    const [quizUserAccount] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("quiz_user_account"), wallet.publicKey.toBuffer(), new anchor.BN(quizId).toArrayLike(Buffer, "le", 1)],
        program.programId
    );

    console.log({
        quizUserAccount: quizUserAccount.toBase58(),
        quizAccount: quizAccount.toBase58(),
        signer: wallet.publicKey.toBase58(),
        systemProgram: anchor.web3.SystemProgram.programId.toBase58(),
    })
    try {
        const txHash = await program.methods
            .answerQuestion(new anchor.BN(quizId), Buffer.from(answers))
            .accounts({
                quizUserAccount,
                quizAccount,
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