import { useNavigate } from "react-router-dom";
import { joinClassNames } from "../../../utils/joinClassNames";
import styles from "./Sidebar.module.css";
interface SidebarProps {
  className?: string;
  disabled?: boolean;
}

// 채팅 페이지에서 높이 제한 필요여부 결정할 것
const Sidebar = ({ className, disabled = false }: SidebarProps) => {
  const classNames = joinClassNames([styles["sidebar"], className]);
  const navigate = useNavigate();

  const chatroomList = [
    {
      id: "12345",
      name: "강남 러닝",
      members: [],
      maxSize: 10,
      lastMessage: {
        sender: {
          userId: "user1",
          nickname: "사용자 1",
        },
        createdAt: "2019-10-01",
        message: "안녕하세요",
      },
    },
    {
      id: "12345677",
      name: "한강 러닝",
      members: [],
      maxSize: 30,
      lastMessage: {
        sender: {
          userId: "user2",
          nickname: "사용자 2",
        },
        createdAt: "2019-10-01",
        message: "안녕하세요",
      },
    },
    {
      id: "12345677",
      name: "한강 러닝",
      members: [],
      maxSize: 30,
      lastMessage: {
        sender: {
          userId: "user2",
          nickname: "사용자 2",
        },
        createdAt: "2019-10-01",
        message: "안녕하세요",
      },
    },
    {
      id: "12345677",
      name: "한강 러닝",
      members: [],
      maxSize: 30,
      lastMessage: {
        sender: {
          userId: "user2",
          nickname: "사용자 2",
        },
        createdAt: "2019-10-01",
        message: "안녕하세요",
      },
    },
    {
      id: "12345677",
      name: "한강 러닝",
      members: [],
      maxSize: 30,
      lastMessage: {
        sender: {
          userId: "user2",
          nickname: "사용자 2",
        },
        createdAt: "2019-10-01",
        message: "안녕하세요",
      },
    },
    {
      id: "12345677",
      name: "한강 러닝",
      members: [],
      maxSize: 30,
      lastMessage: {
        sender: {
          userId: "user2",
          nickname: "사용자 2",
        },
        createdAt: "2019-10-01",
        message: "안녕하세요",
      },
    },
    {
      id: "12345677",
      name: "한강 러닝",
      members: [],
      maxSize: 30,
      lastMessage: {
        sender: {
          userId: "user2",
          nickname: "사용자 2",
        },
        createdAt: "2019-10-01",
        message: "안녕하세요",
      },
    },
    {
      id: "12345677",
      name: "한강 러닝",
      members: [],
      maxSize: 30,
      lastMessage: {
        sender: {
          userId: "user2",
          nickname: "사용자 2",
        },
        createdAt: "2019-10-01",
        message: "안녕하세요",
      },
    },
    {
      id: "12345677",
      name: "한강 러닝",
      members: [],
      maxSize: 30,
      lastMessage: {
        sender: {
          userId: "user2",
          nickname: "사용자 2",
        },
        createdAt: "2019-10-01",
        message: "안녕하세요",
      },
    },
    {
      id: "12345677",
      name: "한강 러닝",
      members: [],
      maxSize: 30,
      lastMessage: {
        sender: {
          userId: "user2",
          nickname: "사용자 2",
        },
        createdAt: "2019-10-01",
        message: "안녕하세요",
      },
    },
  ];

  const handleClick = (chatroomId: string) => {
    navigate(`${chatroomId}`);
  };

  return (
    <div className={classNames}>
      <div className={styles["title"]}>
        <p>채팅방 목록</p>
      </div>
      <div className={styles["list"]}>
        {chatroomList.map((chatroom) => (
          <div
            key={chatroom.id}
            className={styles["item"]}
            onClick={() => handleClick(chatroom.id)}
          >
            <div className={styles["header"]}>
              <span className={styles["name"]}>{chatroom.name}</span>
              <span>
                {chatroom.members.length}/{chatroom.maxSize}
              </span>
            </div>
            <div className={styles["body"]}>
              <span>{chatroom.lastMessage.message}</span>
              <span>{chatroom.lastMessage.createdAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
