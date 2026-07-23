from celery import Celery
from core.config import settings

celery_app = Celery(
  'yaatra-saathi',
  broker = settings.REDIS_URL,
  backend=settings.REDIS_URL,
  include=['tasks.email_tasks', 'tasks.rag_tasks']
)

celery_app.conf.update(
  task_serializer = 'json',
  accept_content=['json'],
  result_serializer = 'json',
  timezone = 'Asia/Kolkata',
  enable_utc = True,
  task_track_started = True,
  task_time_limit = 30*60,
  task_soft_time_limit = 25*40,
  worker_prefetch_multiplier = 4,
  worker_max_tasks_per_child = 1000
)