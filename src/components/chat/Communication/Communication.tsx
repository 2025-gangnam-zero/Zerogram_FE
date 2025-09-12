import { joinClassNames } from "../../../utils/joinClassNames";
import styles from "./Communication.module.css";

interface CommunicationProps {
  className?: string;
  disabled?: boolean;
}

const Communication = ({ className, disabled = false }: CommunicationProps) => {
  const classNames = joinClassNames([styles["communication"], className]);

  return (
    <div className={classNames}>
      <div>타이틀</div>
      <div>대화 내용</div>
    </div>
  );
};

export default Communication;
