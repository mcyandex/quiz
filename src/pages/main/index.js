import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MDBTypography,
  MDBCard,
  MDBCardHeader,
  MDBCardFooter,
  MDBRadio,
  MDBSpinner,
} from "mdb-react-ui-kit";

import { GetRandomChapter, GetBooks } from "../../libs/axios";
import getRandomNumber from "../../libs/getRandomNumber";
import BooksData from "../../consts/BooksData.json";

import "./styles.css";
import { styled } from "@mui/material/styles";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import TelegramIcon from "@mui/icons-material/Telegram";
import NextPlanIcon from "@mui/icons-material/NextPlan";
import CancelIcon from "@mui/icons-material/Cancel";
import { getChapterCounts, getVerseCounts } from "../../libs/getItemCount";

let bookRange = [];
let bookId, chapterRange, chapterId, verseId;

const PROBLEM_NUM = 10;

export default function Main() {
  const { lang, section } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [cardLoading, setCardLoading] = useState(false);

  const [visibleModal, setVisibleModal] = useState(false);
  const [modalSection, setModalSection] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalColor, setModalColor] = useState("");

  const [randomVerse, setRandomVerse] = useState([]);

  const [bookOptions, setBookOptions] = useState([]);
  const [chapterOptions, setChapterOptions] = useState([]);
  const [verseOptions, setVerseOptions] = useState([]);

  const [totalPoints, setTotalPoints] = useState(0);

  const [questionNumber, setQuestionNumber] = useState(1);
  const [answerStatus, setAnswerStatus] = useState(0); // 0: pending, 1: success, 2: failded
  const [questionType, setQuestionType] = useState(0); // 0: book, 1: chapter, 2: verse

  const [selectedOption, setSelectedOption] = useState("");

  const handleNewModal = (section, color, title) => {
    setModalColor(color);
    setModalTitle(title);
    setModalSection(section);
    setVisibleModal(true);
  };

  const getScoreMessage = (score) => {
    let message = "";
    switch (score) {
      case 0:
        message = (
          <div>
            Your Total Score is {score}.<br /> <br /> Maybe just a little more
            study to get you off the mark!
          </div>
        );
        break;
      case 1:
        message = (
          <div>
            Your Total Score is {score}. <br /> <br />
            You're off the mark, nice job!
          </div>
        );
        break;
      case 2:
        message = (
          <div>
            Your Total Score is {score}. <br /> <br /> 2's no fluke, keep'em
            coming
          </div>
        );
        break;
      case 3:
        message = (
          <div>
            Your Total Score is {score}. <br /> <br /> Yes, yes, some more
            studying to take you higher
          </div>
        );
        break;
      case 4:
        message = (
          <div>
            Your Total Score is {score}. <br /> <br /> You're getting the hang
            of it
          </div>
        );
        break;
      case 5:
        message = (
          <div>
            Your Total Score is {score}. <br /> <br /> oh on FIRE!
          </div>
        );
        break;
      case 6:
        message = (
          <div>
            Your Total Score is {score}. <br /> <br /> This is incredible...!
          </div>
        );
        break;
      default:
        message = (
          <div>
            Your Total Score is {score}. <br /> <br /> You're invincible! A true
            Bible Verse Master!
          </div>
        );
        break;
    }
    return message;
  };

  const getQuestion = async () => {
    setIsLoading(true);
    bookRange = section.split("-").map((one) => +one);

    const allBooksSection = await GetBooks(lang);
    const booksOfSection = allBooksSection.filter(
      (one) => one.bookid >= bookRange[0] && one.bookid <= bookRange[1]
    );
    const books = booksOfSection.sort((a, b) => 0.5 - Math.random());
    bookId = books[0].bookid;

    let versionRange = localStorage
      .getItem("section-num")
      .split("-")
      .map((one) => +one);
    let booksNum = getRandomNumber(versionRange[0], versionRange[1]);
    setBookOptions(
      books.splice(0, booksNum).sort((a, b) => a.bookid - b.bookid)
    );

    chapterRange = BooksData.find((one) => one.bookid == bookId).chapters;
    let chapters = [...new Array(chapterRange)]
      .map((_, i) => i + 1)
      .sort((a, b) => 0.5 - Math.random());
    chapterId = chapters[0];
    setChapterOptions(
      chapters.slice(0, getChapterCounts(chapterRange)).sort((a, b) => a - b)
    );

    const randomChapterVerses = await GetRandomChapter(lang, bookId, chapterId);
    randomChapterVerses.sort((a, b) => 0.5 - Math.random());
    setRandomVerse(randomChapterVerses[0]);
    verseId = randomChapterVerses[0].verse;
    setVerseOptions(
      randomChapterVerses
        .slice(0, getVerseCounts(randomChapterVerses.length))
        .sort((a, b) => a.verse - b.verse)
    );
    setTimeout(() => {
      setIsLoading(false);
    }, 900);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption) {
      handleNewModal("WARNING", "warning", "Select the option!");
      return;
    }
    if (questionType == 0) {
      if (selectedOption == bookId) {
        setQuestionType(1);
        setSelectedOption("");
        setCardLoading(true);

        setTimeout(() => {
          setCardLoading(false);
        }, 1000);
      } else {
        setAnswerStatus(2);
        if (questionNumber == PROBLEM_NUM) {
          handleNewModal("summary", "info", getScoreMessage(totalPoints));
          return;
        }
      }
    } else if (questionType == 1) {
      if (selectedOption == chapterId) {
        setQuestionType(2);
        setSelectedOption("");
        setCardLoading(true);

        handleNewModal("", "info", "CORRECT +1");

        setTotalPoints(totalPoints + 1);

        setTimeout(() => {
          setCardLoading(false);
        }, 1000);
      } else {
        setAnswerStatus(2);
        if (questionNumber == PROBLEM_NUM) {
          handleNewModal("summary", "info", getScoreMessage(totalPoints));
          return;
        } else {
          handleNewModal("Wrong Answer", "warning", `Correct: Chapter ${chapterId}`);
        }
      }
    } else {
      if (selectedOption == verseId) {
        setQuestionType(2);

        handleNewModal("", "info", "Additional point +1");

        setTotalPoints(totalPoints + 1);

        setAnswerStatus(1);

        if (questionNumber == PROBLEM_NUM) {
          handleNewModal("summary", "info", getScoreMessage(totalPoints + 1));
          return;
        }
      } else {
        setAnswerStatus(2);
        if (questionNumber == PROBLEM_NUM) {
          handleNewModal("summary", "info", getScoreMessage(totalPoints));
          return;
        } else {
          handleNewModal("Wrong Answer", "warning", `Correct: Verse ${verseId}`);
        }
      }
    }
  };
  const handleNext = () => {
    if (questionNumber == PROBLEM_NUM) {
      handleNewModal("summary", "info", getScoreMessage(totalPoints));
      return;
    }
    getQuestion();
    setQuestionNumber(questionNumber + 1);
    setAnswerStatus(0);
    setQuestionType(0);
    setSelectedOption("");
  };

  const toggleModal = () => {
    setVisibleModal(!visibleModal);
  };

  useEffect(() => {
    getQuestion();
  }, [lang, section]);

  return (
    <div className="main-page h-96 bg-gradient-to-b from-emerald-200 w-full pt-24 sm:pt-28 md:pt-32">
      <MDBTypography
        tag={"h2"}
        className="font-serif text-center text-3xl md:text-5xl xl:text-6xl fw-bold m-4 text-emerald-500 "
      >
        Question {questionNumber}
      </MDBTypography>
      <div className="w-2/3 m-auto md:w-1/2 xl:w-1/3">
        <Slider
          value={questionNumber}
          step={1}
          marks
          min={0}
          max={10}
          className="text-emerald-500"
          color="p"
        />
      </div>
      {isLoading ? (
        <div className="w-full flex justify-center h-full items-center">
          <div className="loading-wave">
            <div className="loading-bar"></div>
            <div className="loading-bar"></div>
            <div className="loading-bar"></div>
            <div className="loading-bar"></div>
          </div>
        </div>
      ) : (
        <div className="w-3/4 m-auto">
          <MDBTypography
            tag={"h4"}
            className="text-center text-xl m-3"
            dangerouslySetInnerHTML={{ __html: randomVerse.text }}
          />
          <MDBCard>
            <MDBCardHeader className="flex justify-center">
              <div className=" text-2xl m-1">Score : </div>
              <strong className="m-0.5 text-3xl">{totalPoints}</strong>
            </MDBCardHeader>
            {cardLoading ? (
              <div className="text-center m-5">
                <MDBSpinner
                  className="m-2"
                  style={{ textAlign: "center", width: "3rem", height: "3rem" }}
                >
                  <span className="visually-hidden">Loading...</span>
                </MDBSpinner>
              </div>
            ) : (
              <div>
                <div className="flex flex-row justify-between">
                  <Button
                    variant="contained"
                    className="m-3 w-0 md:w-32"
                    color="error"
                    onClick={() => {
                      navigate("/before");
                    }}
                  >
                    <div className="flex flex-row items-center align-middle gap-1">
                      <RestartAltIcon />
                      <div className="hidden sm:block">Restart</div>
                    </div>
                  </Button>
                  <Button
                    variant="contained"
                    className="m-3 w-0 md:w-32"
                    color="info"
                    onClick={handleSubmitAnswer}
                    style={
                      !answerStatus ? { display: "block" } : { display: "none" }
                    }
                  >
                    <div className="flex flex-row items-center align-middle gap-1 justify-center">
                      <TelegramIcon />
                      <div className="hidden sm:block">Submit</div>
                    </div>
                  </Button>
                  <Button
                    variant="contained"
                    className="m-3 w-0 md:w-32"
                    color="success"
                    onClick={handleNext}
                    style={
                      answerStatus && questionNumber != PROBLEM_NUM
                        ? { display: "block" }
                        : { display: "none" }
                    }
                  >
                    <div className="flex flex-row items-center align-middle gap-1 justify-center">
                      <NextPlanIcon />
                      <div className="hidden sm:block">Next</div>
                    </div>
                  </Button>
                </div>
                <MDBCardFooter>
                  {questionType === 0 ? (
                    <div>
                      <div className="my-3 mx-0">
                        Select the correct Book where this verse came from.
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {bookOptions.map((one, index) => {
                          return (
                            <div
                              key={index}
                              className="p-2 rounded-lg border-[1px]"
                              onClick={(_, e) => {
                                console.log("1111", one.bookid, bookId);
                                setSelectedOption(one.bookid);
                              }}
                            >
                              <MDBRadio
                                key={one.bookid}
                                name="bookOption"
                                id={one.bookid}
                                label={one.name}
                                value={one.bookid}
                                checked={one.bookid == selectedOption}
                                readOnly
                                labelStyle={
                                  questionType == 0 && answerStatus == 2
                                    ? one.bookid === selectedOption
                                      ? { textDecoration: "line-through" }
                                      : one.bookid == bookId
                                      ? {}
                                      : {}
                                    : {}
                                }
                                wrapperStyle={
                                  questionType == 0 && answerStatus == 2
                                    ? one.bookid == selectedOption
                                      ? { color: "red" }
                                      : one.bookid == bookId
                                      ? {
                                          color: "green",
                                          fontWeight: "bolder",
                                        }
                                      : { color: "black" }
                                    : {}
                                }
                                wrapperClass="mb-0"
                                disabled={answerStatus}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : questionType === 1 ? (
                    <div>
                      <div className="my-3 mx-0">
                        Select the correct Chapter where this verse came from.
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {chapterOptions.map((one, i) => {
                          return (
                            <div
                              key={i}
                              className="p-2 rounded-lg border-[1px]"
                              onClick={() => {
                                console.log("2222", one, chapterId);
                                setSelectedOption(one);
                              }}
                            >
                              <MDBRadio
                                key={one}
                                name="bookOption"
                                id={one}
                                label={`Chapter ${one}`}
                                value={one}
                                checked={one == selectedOption}
                                readOnly
                                labelStyle={
                                  questionType == 1 && answerStatus == 2
                                    ? one === selectedOption
                                      ? { textDecoration: "line-through" }
                                      : one == chapterId
                                      ? {}
                                      : {}
                                    : {}
                                }
                                wrapperStyle={
                                  questionType == 1 && answerStatus == 2
                                    ? one == selectedOption
                                      ? { color: "red" }
                                      : one == chapterId
                                      ? {
                                          color: "green",
                                          fontWeight: "bolder",
                                        }
                                      : { color: "black" }
                                    : {}
                                }
                                disabled={answerStatus}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="my-3 mx-0">Select the correct Verse.</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {verseOptions.map((one, index) => {
                          return (
                            <div
                              key={index}
                              className="p-2 rounded-lg border-[1px]"
                              onClick={() => {
                                console.log("333333", one.verse, verseId);
                                setSelectedOption(one.verse);
                              }}
                            >
                              <MDBRadio
                                key={one.pk}
                                name="verseOption"
                                id={one.verse}
                                label={one.verse}
                                value={one.verse}
                                readOnly
                                checked={one.verse == selectedOption}
                                labelStyle={
                                  questionType == 2 && answerStatus == 2
                                    ? one.verse === selectedOption
                                      ? { textDecoration: "line-through" }
                                      : one.verse == verseId
                                      ? {}
                                      : {}
                                    : {}
                                }
                                wrapperStyle={
                                  questionType == 2 && answerStatus == 2
                                    ? one.verse == selectedOption
                                      ? { color: "red" }
                                      : one.verse == verseId
                                      ? {
                                          color: "green",
                                          fontWeight: "bolder",
                                        }
                                      : { color: "black" }
                                    : {}
                                }
                                disabled={answerStatus}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </MDBCardFooter>
              </div>
            )}
          </MDBCard>
        </div>
      )}

      <BootstrapDialog
        onClose={toggleModal}
        aria-labelledby="customized-dialog-title"
        open={visibleModal}
        className="m-auto"
      >
        <DialogTitle
          sx={{ m: 0, p: 2 }}
          id="customized-dialog-title"
          className={`text-${modalColor} h-14`}
        >
          {modalSection.toUpperCase()}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={toggleModal}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <div
            className={`py-10 px-4 w-full sm:w-[400px] text-center text-${modalColor} text-xl`}
          >
            {modalTitle}
          </div>
        </DialogContent>
        <DialogActions>
          {modalSection == "summary" ? (
            <Button
              variant="contained"
              color="error"
              className="m-2"
              onClick={toggleModal}
            >
              <div>
                <CancelIcon /> Close
              </div>
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              className="m-2"
              onClick={toggleModal}
            >
              <div>
                Continue <NextPlanIcon />
              </div>
            </Button>
          )}
        </DialogActions>
      </BootstrapDialog>
    </div>
  );
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));
