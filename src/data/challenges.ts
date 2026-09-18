import { ChallengeInfo, ChallengeType } from '../types';

export const CHALLENGE_DEFINITIONS: Record<ChallengeType, ChallengeInfo> = {
  mouth_pucker: {
    id: 'mouth_pucker',
    name: 'CHU MÔI',
    instruction: 'Hãy CHU MÔI để giành quyền trả lời câu hỏi!',
    defaultScore: 100,
    icon: '😗'
  },
  smile: {
    id: 'smile',
    name: 'CƯỜI MỈM',
    instruction: 'Hãy CƯỜI MỈM tươi tắn để ghi điểm!',
    defaultScore: 50,
    icon: '😊'
  },
  grin: {
    id: 'grin',
    name: 'CƯỜI LỘ RĂNG',
    instruction: 'Hãy CƯỜI LỘ RĂNG rạng rỡ để vượt qua thử thách!',
    defaultScore: 40,
    icon: '😁'
  },
  wink_left: {
    id: 'wink_left',
    name: 'NHÁY MẮT TRÁI',
    instruction: 'Hãy NHÁY MẮT TRÁI (mắt trái của bạn) để giành quyền!',
    defaultScore: 20,
    icon: '😉'
  },
  wink_right: {
    id: 'wink_right',
    name: 'NHÁY MẮT PHẢI',
    instruction: 'Hãy NHÁY MẮT PHẢI (mắt phải của bạn) để mở câu hỏi!',
    defaultScore: 20,
    icon: '😜'
  },
  eyes_closed: {
    id: 'eyes_closed',
    name: 'NHẮM HAI MẮT',
    instruction: 'Hãy NHẮM CẢ HAI MẮT lại để hoàn thành thử thách!',
    defaultScore: 70,
    icon: '😌'
  },
  mouth_open: {
    id: 'mouth_open',
    name: 'MỞ MIỆNG',
    instruction: 'Hãy MỞ MIỆNG vừa phải để ghi điểm!',
    defaultScore: 60,
    icon: '😮'
  },
  mouth_stretch: {
    id: 'mouth_stretch',
    name: 'HÁ MIỆNG TO',
    instruction: 'Hãy HÁ MIỆNG THẬT TO để bứt phá!',
    defaultScore: 75,
    icon: '😲'
  },
  head_shake: {
    id: 'head_shake',
    name: 'LẮC ĐẦU',
    instruction: 'Hãy LẮC ĐẦU SANG TRÁI / PHẢI nhịp nhàng!',
    defaultScore: 65,
    icon: '↔️'
  },
  head_nod: {
    id: 'head_nod',
    name: 'GẬT ĐẦU',
    instruction: 'Hãy GẬT ĐẦU LÊN XUỐNG nhịp nhàng!',
    defaultScore: 65,
    icon: '↕️'
  },
  cheek_puff: {
    id: 'cheek_puff',
    name: 'PHỒNG MÁ',
    instruction: 'Hãy PHỒNG CĂNG HAI MÁ để ghi điểm!',
    defaultScore: 70,
    icon: '🐡'
  },
  brow_raise: {
    id: 'brow_raise',
    name: 'NÂNG CHÂN MÀY',
    instruction: 'Hãy NÂNG CAO HAI CHÂN MÀY để kích hoạt!',
    defaultScore: 65,
    icon: '🤨'
  }
};

export const ALL_CHALLENGE_KEYS = Object.keys(CHALLENGE_DEFINITIONS) as ChallengeType[];
