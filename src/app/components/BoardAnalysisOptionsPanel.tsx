import ToggleSwitch from "./ToggleSwitch";

interface BoardAnalysisOptionsPanelProps {
    centralImportanceIsOn: boolean;
    setCentralImportanceIsOn: (value: boolean) => void;
    currentPlayerControlIsOn: boolean;
    setCurrentPlayerControlIsOn: (value: boolean) => void;
    waitingPlayerControlIsOn: boolean;
    setWaitingPlayerControlIsOn: (value: boolean) => void;
    reverseWeightsIsOn: boolean;
    setReverseWeightsIsOn: (value: boolean) => void;
    isFlipped: boolean;
    setIsFlipped: (value: boolean) => void;
    removeShading: boolean;
    setRemoveShading: (value: boolean) => void;
}
const BoardAnalysisOptionsPanel = ({
    centralImportanceIsOn,
    setCentralImportanceIsOn,
    currentPlayerControlIsOn,
    setCurrentPlayerControlIsOn,
    waitingPlayerControlIsOn,
    setWaitingPlayerControlIsOn,
    reverseWeightsIsOn,
    setReverseWeightsIsOn,
    isFlipped,
    setIsFlipped,
    removeShading,
    setRemoveShading
}: BoardAnalysisOptionsPanelProps) => {
    return (
        <div className="inline-block ml-4 align-top pt-4">
        <div className="flex flex-col gap-2">
          <ToggleSwitch
            color="blue"
            label="Show Central Importance"
            checked={centralImportanceIsOn}
            onChange={setCentralImportanceIsOn}
          />
          <ToggleSwitch
            color="green"
            label="Show Current Player Control"
            checked={currentPlayerControlIsOn}
            onChange={setCurrentPlayerControlIsOn}
          />
          <ToggleSwitch
            color="red"
            label="Show Waiting Player Control"
            checked={waitingPlayerControlIsOn}
            onChange={setWaitingPlayerControlIsOn}
          />
          <ToggleSwitch
            color="purple"
            label="Calculate by Reverse-Weights"
            checked={reverseWeightsIsOn}
            onChange={setReverseWeightsIsOn}
          />
          <ToggleSwitch
            color="yellow"
            label="Flip Board"
            checked={isFlipped}
            onChange={setIsFlipped}
          />
          <ToggleSwitch
            color="black"
            label="Remove Square Shading"
            checked={removeShading}
            onChange={setRemoveShading}
          />
        </div>
      </div>
    )
}

export default BoardAnalysisOptionsPanel;