import { useState, useEffect } from "react";
import { analyzeAnswers } from "./api/analyze";
import { track } from './analytics';

import { API_URL } from "./api/config";

import IntroScreen from "./screens/IntroScreen";
import QuestionsScreen from "./screens/QuestionsScreen";
import LoadingScreen from "./screens/LoadingScreen";
import HookScreen from "./screens/HookScreen";
import AuthScreen from "./screens/AuthScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import CodeDisplayScreen from "./screens/CodeDisplayScreen";
import GoalsScreen from "./screens/GoalsScreen";
import ModelScreen from "./screens/ModelScreen";
import UpdateScreen from "./screens/UpdateScreen";
import DeltaScreen from "./screens/DeltaScreen";

export default function App() {
  const [screen, setScreen] = useState("intro"); // intro | questions | hook | model
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([""]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [hookVisible, setHookVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [pvAnimated, setPvAnimated] = useState(0);
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [winConditions, setWinConditions] = useState([]);
  const [newCondition, setNewCondition] = useState("");
  const [actions, setActions] = useState(null);
  const [suggestedWinConditions, setSuggestedWinConditions] = useState([]);
  const [showWinConditions, setShowWinConditions] = useState(false);
  const [actionsLoading, setActionsLoading] = useState(false);
  const [paramsAnimated, setParamsAnimated] = useState(0);
  const [activeInfo, setActiveInfo] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingDots, setLoadingDots] = useState(1);
  const [userId, setUserId] = useState(null);
  const [userCode, setUserCode] = useState(null);
  const [previousParams, setPreviousParams] = useState(null);
  const [outOfScopeMessage, setOutOfScopeMessage] = useState(false);
  const [outOfScopeVisible, setOutOfScopeVisible] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [showLogout, setShowLogout] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 375);
  const [rateLimitMessage, setRateLimitMessage] = useState(false);
  const [rateLimitVisible, setRateLimitVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (screen === "hook") {
      setTimeout(() => setHookVisible(true), 400);
    }

    if (screen === "model") {
      let start = 0;
      const target = apiData.pv;
      const step = target / 40;
      const interval = setInterval(() => {
        start += step;
        if (start >= target) {
          setPvAnimated(target);
          clearInterval(interval);
        } else {
          setPvAnimated(start);
        }
      }, 30);

      let paramStart = 0;
      const paramInterval = setInterval(() => {
        paramStart += 2.5;
        if (paramStart >= 100) {
          setParamsAnimated(100);
          clearInterval(paramInterval);
        } else {
          setParamsAnimated(paramStart);
        }
      }, 20);

      return () => {
        clearInterval(interval);
        clearInterval(paramInterval);
      };
    }
  }, [screen]);

  useEffect(() => {
    const savedUserId = localStorage.getItem("gt_user_id");
    if (savedUserId) {
      setUserId(savedUserId);
      fetch(`${API_URL}/users/${savedUserId}/last_session`)
        .then(r => r.json())
        .then(sessionData => {
          if (sessionData.session && sessionData.session.pv !== null) {
            const params = sessionData.session.parameters;
            setApiData({
              session_id: sessionData.session.session_id,
              pv: sessionData.session.pv,
              current_phase: sessionData.session.current_phase,
              total_phases: sessionData.session.total_phases,
              utility_params: params?.utility?.map(p => ({...p, display_name: p.display_name || p.name})) || [],
              cost_params: params?.cost?.map(p => ({...p, display_name: p.display_name || p.name})) || [],
              suggested_goals: [],
              hook: "",
              scenario_title: sessionData.session.scenario_title || "",
              current_stage: sessionData.session.current_stage || "",
            });
            fetch(`${API_URL}/users/${savedUserId}`)
              .then(r => r.json())
              .then(userData => setUserInfo(userData));
            if (sessionData.session.win_conditions) {
              setWinConditions(sessionData.session.win_conditions);
            }
            if (sessionData.session.actions && sessionData.session.actions.length > 0) {
              const selectedActionData = sessionData.session.actions.find(a => a.is_selected);
              setActions(sessionData.session.actions);
              if (selectedActionData) {
                setSelectedAction(sessionData.session.actions.indexOf(selectedActionData));
              }
            }
            setScreen("model");
          }
        });
    }
  }, []);

  useEffect(() => {
    if (screen !== "loading") return;
      
    setLoadingStep(0);
    setLoadingDots(1);

    let step = 0;
    let dots = 1;

    const interval = setInterval(() => {
      dots += 1;
      if (dots > 3) {
        dots = 1;
        step += 1;
      }
      setLoadingDots(dots);
      setLoadingStep(step);
    }, 1000);

    return () => clearInterval(interval);
  }, [screen]);

  useEffect(() => {
    if (actions && actions.length > 0) {
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }, 100);
    }
  }, [actions]);

  const handleAnswer = async () => {
    if (!currentAnswer.trim()) return;
    const updated = [...answers];
    updated[questionIndex] = currentAnswer;
    setAnswers(updated);
    setCurrentAnswer("");

    if (questionIndex < 0) {
      setQuestionIndex(questionIndex + 1);
    } else {
      setLoading(true);
      setError(null);
      setScreen("loading");
      try {
        track('story_submitted', { scenario: 'dating' });
        const data = await analyzeAnswers(updated, { useLlm: true, userId: userId });
        if (data.status === "out_of_scope") {
          setScreen("intro");
          setOutOfScopeMessage(true);
          setOutOfScopeVisible(true);
          setTimeout(() => {
            setOutOfScopeVisible(false);
            setTimeout(() => setOutOfScopeMessage(false), 1000);
          }, 5000);
          return;
        }

        setApiData(data);
        setScreen("hook");
      } catch (err) {
        if (err.message === "rate_limited") {
          setScreen("intro");
          track('rate_limited', { screen: screen });
          setRateLimitMessage(true);
          setRateLimitVisible(true);
          setTimeout(() => {
            setRateLimitVisible(false);
            setTimeout(() => setRateLimitMessage(false), 1000);
          }, 5000);
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const bg = {
    minHeight: "100vh",
    background: "var(--bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-sans)",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
  };

  const grain = {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    opacity: 0.03,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    backgroundSize: "200px",
    zIndex: 0,
  };

  const card = {
    width: "100%",
    maxWidth: "480px",
    position: "relative",
    zIndex: 1,
  };

  if (screen === "intro") {
    return <IntroScreen setScreen={setScreen} outOfScopeMessage={outOfScopeMessage} outOfScopeVisible={outOfScopeVisible} rateLimitMessage={rateLimitMessage} rateLimitVisible={rateLimitVisible} bg={bg} grain={grain} card={card} />;
  }

  if (screen === "questions") {
    return <QuestionsScreen questionIndex={questionIndex} currentAnswer={currentAnswer} setCurrentAnswer={setCurrentAnswer} loading={loading} handleAnswer={handleAnswer} bg={bg} grain={grain} card={card} />;
  }

  if (screen === "loading") {
    return <LoadingScreen loadingStep={loadingStep} loadingDots={loadingDots} bg={bg} grain={grain} card={card} />;
  }

  if (screen === "hook") {
    return <HookScreen hookVisible={hookVisible} apiData={apiData} setScreen={setScreen} bg={bg} grain={grain} card={card} />;
  }

  if (screen === "auth") {
    return <AuthScreen setScreen={setScreen} apiData={apiData} setUserId={setUserId} setUserCode={setUserCode} setUserInfo={setUserInfo} bg={bg} grain={grain} card={card} />;
  }

  if (screen === "login") {
    return <LoginScreen setScreen={setScreen} setUserId={setUserId} setApiData={setApiData} setUserInfo={setUserInfo} setWinConditions={setWinConditions} setActions={setActions} setSelectedAction={setSelectedAction} bg={bg} grain={grain} card={card} />;
  }

  if (screen === "register") {
    return <RegisterScreen setScreen={setScreen} apiData={apiData} setUserId={setUserId} setUserInfo={setUserInfo} bg={bg} grain={grain} card={card} />;
  }

  if (screen === "code_display") {
    return <CodeDisplayScreen setScreen={setScreen} userCode={userCode} bg={bg} grain={grain} card={card} />;
  }

  if (screen === "goals") {
    return <GoalsScreen setScreen={setScreen} apiData={apiData} selectedGoal={selectedGoal} setSelectedGoal={setSelectedGoal} setActions={setActions} setSelectedAction={setSelectedAction} setShowWinConditions={setShowWinConditions} setSuggestedWinConditions={setSuggestedWinConditions} setWinConditions={setWinConditions} bg={bg} grain={grain} card={card} />;
  }

  if (screen === "delta") {
    return <DeltaScreen apiData={apiData} previousParams={previousParams} setScreen={setScreen} setWinConditions={setWinConditions} setActions={setActions} setSelectedAction={setSelectedAction} setShowWinConditions={setShowWinConditions} setSuggestedWinConditions={setSuggestedWinConditions} bg={bg} grain={grain} card={card} />;
  }

  if (screen === "update") {
    return <UpdateScreen setScreen={setScreen} apiData={apiData} setApiData={setApiData} currentAnswer={currentAnswer} setCurrentAnswer={setCurrentAnswer} actions={actions} selectedAction={selectedAction} setActions={setActions} setSelectedAction={setSelectedAction} setPreviousParams={setPreviousParams} setRateLimitMessage={setRateLimitMessage} setRateLimitVisible={setRateLimitVisible} bg={bg} grain={grain} card={card} />;
  }

  if (screen === "model") {
    return <ModelScreen
      apiData={apiData} selectedGoal={selectedGoal}
      pvAnimated={pvAnimated} paramsAnimated={paramsAnimated}
      activeInfo={activeInfo} setActiveInfo={setActiveInfo}
      actions={actions} setActions={setActions}
      actionsLoading={actionsLoading} setActionsLoading={setActionsLoading}
      selectedAction={selectedAction} setSelectedAction={setSelectedAction}
      showWinConditions={showWinConditions} setShowWinConditions={setShowWinConditions}
      suggestedWinConditions={suggestedWinConditions} setSuggestedWinConditions={setSuggestedWinConditions}
      winConditions={winConditions} setWinConditions={setWinConditions}
      newCondition={newCondition} setNewCondition={setNewCondition}
      userInfo={userInfo} setUserInfo={setUserInfo}
      setUserId={setUserId} setApiData={setApiData}
      showLogout={showLogout} setShowLogout={setShowLogout}
      isMobile={isMobile} isSmallMobile={isSmallMobile}
      setScreen={setScreen} setRateLimitMessage={setRateLimitMessage} 
      setRateLimitVisible={setRateLimitVisible} bg={bg} grain={grain} card={card}
    />;
  }
}