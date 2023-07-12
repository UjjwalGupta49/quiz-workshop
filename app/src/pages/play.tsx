import Head from 'next/head'
import { Box, Button, Divider, Flex, Menu, MenuButton, MenuItem, MenuList, Text, useToast } from '@chakra-ui/react'
import { Navbar } from '@/components/Navbar'
import { useEffect, useState } from 'react'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import { useRouter } from 'next/router'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { anchorProgram } from '@/util/helper'
import { ActionBox } from '@/components/ActionBox'
import { getQuizAccount } from '@/util/program/fetchQuiz'
import { answerQuestion } from '@/util/program/answerQuestion'


export default function Home() {

  const [accounts, setAccounts] = useState<any[]>([])

  const [currentAccount, setCurrentAccount] = useState<any>()
  const [answers, setAnswers] = useState<any>()
  const [userResponse, setUserResponse] = useState<any[]>([])

  const wallet = useAnchorWallet()
  const router = useRouter()
  const toast = useToast()
  const [num, setNum] = useState<number>(0)

  useEffect(() => {
    if (!wallet) return

    const localData = localStorage.getItem("answers_left")
    if (localData) {
      const localDataParsed = JSON.parse(localData)
      setUserResponse(localDataParsed)
    }
    const run = async () => {
      const quizId = router.query.quizId;
      if (!quizId) return
      const res = await getQuizAccount(wallet as NodeWallet, Number(quizId))
      console.log("QUIZ ACCOUNT: ", res)
      setCurrentAccount(res)

      const dataUri = res.account.dataUri
      const jsonData = await fetch(dataUri)
      const dataResult = await jsonData.json()
      console.log(dataResult)
      setAnswers(dataResult["questions"])
    }
    run()

  }, [router.query.quizId, wallet])


  const answerQuizQuestion = async (index: number) => {
    const newRes = [...userResponse, index + 1];
    localStorage.setItem("answers_left", JSON.stringify(newRes))
    console.log(newRes)
    const res = await answerQuestion(wallet as NodeWallet, newRes, Number(router.query.quizId));
    console.log(res);
    if (res.error) {
      toast({
        status: "error",
        title: res.error
      });
      return;
    }
    toast({
      status: "success",
      title: "Tx: " + res.sig
    });
    setUserResponse(newRes);

    if (newRes.length == 5) {
      console.log(currentAccount)
      const correctArray = currentAccount.account.correctAnswers
      let numberCorrect = 0;
      for (let i = 0; i < correctArray.length; i++) {
        if (correctArray[i] === newRes[i]) {
          numberCorrect++;
        }
      }
      setNum(numberCorrect)
    }
  };


  return (
    <>
      <Head>
        <title>Lets Play the Quiz!</title>
        <meta name="description" content="Play Quiz and get airdrop rewards for correct answers!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      {currentAccount && currentAccount.account.isStarted ? <Flex overflow="hidden" gap="1rem" bg="#05070D" align="center" minH="100vh" h="100%" p="0 5rem" flexFlow="column">


        <Flex gap="1rem" bg="#05070D" justify="space-around" align="center" w="100%">




          <Box bg="#0A0E1A" p="2rem" borderRadius="20px" mt="2rem" width="65%" minH="60vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center" boxShadow="md">

            {userResponse.length == 5 ? <Box>
              <Text fontSize="4rem" fontWeight={700} color="blue.200">

              You Are Done! Good Job!
            </Text>
            <Text fontSize="5rem" fontWeight={700} color="white">

              {num}/5 Answers Correct  ✅
            </Text>
            </Box> : null}
            {answers && userResponse.length < 5 && answers[userResponse.length] && <Flex flexFlow="column">

              <Text mt="40px" fontSize="3rem" fontWeight="bold" color="white" textAlign="center">{answers[userResponse.length]["question"]}</Text>
              <Divider borderColor="#242D45" my="2rem" />

              <Flex justify="center" w="100%" gap="1rem" flexFlow="column">
                {answers[userResponse.length]["options"].map(((option: any, index: number) => (
                  <Box
                    mr="3rem" textAlign="center" borderRadius="1rem" key={option} cursor="pointer" background="#0e1626"
                    w="100%"
                    onClick={() => answerQuizQuestion(index)}>
                    <Text color="#4A526D" fontSize="4xl" fontWeight="semibold" mb="0.5rem">{option}</Text>
                  </Box>
                )))}
              </Flex>

            </Flex>}
          </Box>


        </Flex>
      </Flex > : <Flex bg="#05070D" h="95vh" justify="center" align="center">

        <Text fontSize="6rem" fontWeight={700} color="white">Quiz Is Yet To Start! ⏳</Text>
      </Flex>}


    </>
  )
}
