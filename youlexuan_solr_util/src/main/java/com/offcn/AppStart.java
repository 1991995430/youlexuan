package com.offcn;

import org.springframework.context.support.ClassPathXmlApplicationContext;

public class AppStart {
    public static void main(String[] args) {
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("classpath*:spring/applicationContext-*.xml");

        FromDatabaseToSolr  bean=(FromDatabaseToSolr) context.getBean("fromDatabaseToSolr");

        bean.importSolr();
    }
}
