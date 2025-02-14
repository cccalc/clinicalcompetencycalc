'use client';

import EnterUsername from './enter-username';
import {FormDataYAML} from '@/utils/types';
import TaggingInterface from './tagging-interface';
import {useState} from 'react';

export default function ClientPage({formData}: {formData: FormDataYAML | undefined}) {
  const [username, setUsername] = useState<string>('');

  if (!username) {
    return <EnterUsername setUsername={setUsername} />;
  } else {
    return <TaggingInterface formData={formData} username={{set: setUsername, val: username}} />;
  }
}
