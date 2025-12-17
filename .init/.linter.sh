#!/bin/bash
cd /home/kavia/workspace/code-generation/elegant-kanban-board-297663-297672/kanban_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

