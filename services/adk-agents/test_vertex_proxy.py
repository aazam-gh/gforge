from vertex_proxy import preserve_missing_thought_signatures


def test_adds_validator_only_to_missing_assistant_tool_signature():
    payload = {
        'messages': [
            {'role': 'user', 'content': 'investigate'},
            {
                'role': 'assistant',
                'tool_calls': [
                    {'id': 'call-1', 'type': 'function', 'function': {'name': 'read'}},
                    {'id': 'call-2', 'type': 'function', 'function': {'name': 'read'}},
                ],
            },
        ]
    }

    result = preserve_missing_thought_signatures(payload)

    assert result['messages'][1]['tool_calls'][0]['extra_content']['google'][
        'thought_signature'
    ] == 'skip_thought_signature_validator'
    assert 'extra_content' not in result['messages'][1]['tool_calls'][1]


def test_preserves_real_signature():
    payload = {
        'messages': [
            {
                'role': 'assistant',
                'tool_calls': [
                    {
                        'extra_content': {
                            'google': {'thought_signature': 'real-signature'}
                        }
                    }
                ],
            }
        ]
    }

    result = preserve_missing_thought_signatures(payload)

    assert result['messages'][0]['tool_calls'][0]['extra_content']['google'][
        'thought_signature'
    ] == 'real-signature'
