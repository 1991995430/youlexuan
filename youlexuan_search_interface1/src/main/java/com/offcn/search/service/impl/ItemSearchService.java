package com.offcn.search.service.impl;

import com.offcn.pojo.TbItem;

import java.util.List;
import java.util.Map;

public interface ItemSearchService {

    //搜索
    public Map<String,Object> search(Map searchMap);

    public void importList(List<TbItem> list);

    public void deleteByGoodsIds(List goodsIdList);
}
