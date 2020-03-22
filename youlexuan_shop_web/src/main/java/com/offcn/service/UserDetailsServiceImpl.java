package com.offcn.service;

import com.offcn.pojo.TbSeller;
import com.offcn.sellergoods.service.SellerService;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.ArrayList;
import java.util.List;

/**
 * @author songmu
 * @create 2019-07-10 22:25
 */
public class UserDetailsServiceImpl implements UserDetailsService {

    private SellerService sellerService;

    public void setSellerService(SellerService sellerService) {
        this.sellerService = sellerService;
    }

        @Override
        public UserDetails loadUserByUsername(String username) throws
        UsernameNotFoundException {
            System.out.println("经过了 UserDetailsServiceImpl");
            //构建角色列表
            List<GrantedAuthority> grantAuths=new ArrayList();
            grantAuths.add(new SimpleGrantedAuthority("ROLE_SELLER"));
            //得到商家对象
            TbSeller seller = sellerService.findOne(username);
            System.out.println("**密码**"+seller.getPassword());

           /* return new User(username,seller.getPassword(),grantAuths);*/
            //TbSeller seller = sellerService.findOne(username);
            System.out.println("::::::"+seller.getSellerId());

            if(seller!=null){
                System.out.println("**********"+seller.getStatus()+"************");
                if(seller.getStatus().equals("1")){
                    System.out.println("**********************");
                    return new User(username,seller.getPassword(),grantAuths);
                }else{
                    return null;
                }
            }else{
                return null;
            }
        }
}
