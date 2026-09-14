-- 日报处理状态：
-- pending_confirmation 待用户确认
-- analyzing_nutrition 已提交，正在分析营养
-- generating_report 正在生成日报
-- completed 日报已完成
-- nutrition_failed 营养分析失败
-- report_failed 日报生成失败
comment on column public.diet_daily_report.status is
    '日报处理状态：pending_confirmation待用户确认，analyzing_nutrition已提交并分析营养，generating_report生成日报中，completed已完成，nutrition_failed营养分析失败，report_failed日报生成失败';
