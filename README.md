# NBA Performance Signals

## Sobre

NBA Performance Signals é uma plataforma full stack de Data Science para análise e monitoramento de performance de jogadores e times da NBA. O sistema coleta estatísticas diárias, calcula métricas de performance e expõe os dados via API REST para um dashboard interativo.

## Stack

| Camada      | Tecnologia                              |
|-------------|------------------------------------------|
| Backend     | FastAPI + SQLAlchemy + Alembic           |
| Banco dados | PostgreSQL                               |
| Data/ML     | Pandas, NumPy                            |
| Frontend    | Next.js 14 + TypeScript + Tailwind CSS   |
| Pipeline    | Python script agendado (cron/APScheduler)|

## Como rodar

### Pré-requisitos

- Python 3.11+
- Node.js 18+
- PostgreSQL rodando localmente

### Backend

```bash
cd api
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # edite DATABASE_URL conforme sua instância
uvicorn app.main:app --reload
```

Acesse a documentação interativa em: `http://localhost:8000/docs`

### Frontend

```bash
cd web
npm install
npm run dev
```

Acesse em: `http://localhost:3000`

### Pipeline diário

```bash
cd api
python -m app.pipeline.daily_update
```
