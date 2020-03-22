package com.offcn.search.controller;


import com.alibaba.dubbo.config.annotation.Reference;
import com.offcn.search.service.impl.ItemSearchService;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * @author songmu
 * @create 2019-07-18 15:53
 */
@RestController
@RequestMapping("/itemsearch")
public class ItemSearchController {

    @Reference
    private ItemSearchService itemSearchService;

    @RequestMapping("/search")
    public Map<String, Object> search(@RequestBody Map searchMap) {
        System.out.println("进入到controller");
        return itemSearchService.search(searchMap);
    }
}
