from django.urls import path
from .views import ProctoringAIView, StartProctorView, StopProctorView

urlpatterns = [
    path('detect/', ProctoringAIView.as_view(), name='ai_detect'),
    path('launcher/start/', StartProctorView.as_view(), name='proctor_start'),
    path('launcher/stop/', StopProctorView.as_view(), name='proctor_stop'),
]
