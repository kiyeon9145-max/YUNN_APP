"use client";

// page.tsx — /routine 오케스트레이터
//
// useRoutine() 훅이 계산한 screen 값에 따라 4개 화면 중 하나를 렌더링한다.
// 날짜 계산·저장·분석 이벤트는 훅과 하위 lib 계층이 전담하고, 이 파일은 라우팅만 한다.

import { useRoutine } from "./lib/use-routine";
import GuardScreen from "./screens/GuardScreen";
import StartScreen from "./screens/StartScreen";
import RoutineScreen from "./screens/RoutineScreen";
import CompareScreen from "./screens/CompareScreen";
import ReminderModal from "./components/ReminderModal";

export default function RoutinePage() {
  const {
    screen,
    day,
    streak,
    progress,
    todayChecks,
    config,
    unlocked,
    beforePhoto,
    afterPhoto,
    startRoutine,
    toggleStep,
    completeAfterPhoto,
  } = useRoutine();

  // localStorage 값을 아직 읽지 못한 첫 렌더 — 화면 깜빡임 방지를 위해 빈 화면
  if (screen === "loading") return null;

  if (screen === "guard") return <GuardScreen />;
  if (screen === "start") return <StartScreen onStart={startRoutine} />;

  if (screen === "compare") {
    return (
      <CompareScreen day={day} streak={streak} beforePhoto={beforePhoto} afterPhoto={afterPhoto} />
    );
  }

  // screen === "routine" — pendingResult가 있어야만 도달하므로 config는 항상 존재해야 하지만
  // 타입 안전을 위해 명시적으로 가드한다.
  if (!config) return null;

  return (
    <>
      <ReminderModal />
      <RoutineScreen
        day={day}
        streak={streak}
        progress={progress}
        todayChecks={todayChecks}
        config={config}
        unlocked={unlocked}
        afterPhoto={afterPhoto}
        onToggleStep={toggleStep}
        onAfterPhoto={completeAfterPhoto}
      />
    </>
  );
}
