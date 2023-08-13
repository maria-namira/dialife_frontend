import React, {MouseEvent, useEffect, useState} from "react";
import {IPost} from "../slices/postSlice/interfaces";
import {instAxios} from "../utils/axios";
import {toast} from "react-toastify";
import {useAppDispatch, useAppSelector} from "../hooks/hooks";
import {checkAuth} from "../slices/authSlice/authSlice";
import {nanoid} from "nanoid";
import {Paths} from "../paths";
import {Link, useNavigate} from "react-router-dom";
import {Button} from "../components/Main/Button";
import {removePost} from "../slices/postSlice/asyncFunc";
import {
    postErrorSelector,
    postStatusSelector,
} from "../slices/postSlice/postSlice";
import Popup from "../components/Main/Popup";
import MyPostsItem from "../components/Main/MyPostsItem";
import {fetchUserPosts} from "../utils/fetchUserPosts";
import {Loading} from "../components/Main/Loading";

export const MyPostsPage = (): JSX.Element => {
    const [posts, setPosts] = useState<IPost[] | undefined>(undefined);
    const [popup, setPopup] = useState(false);
    const [postId, setPostId] = useState("");
    const [loading, setLoading] = useState(false);
    const isAuth = useAppSelector(checkAuth);
    const status = useAppSelector(postStatusSelector);
    const error = useAppSelector(postErrorSelector);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!isAuth) {
            navigate(Paths.HOME);
        }
    }, [isAuth]);

    useEffect(() => {
        setLoading(true);
        fetchUserPosts()
            .then((data) => {
                setPosts(data)
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                toast.error(error.message, {theme: "colored"});
            });
    }, []);

    const handleRemoveBtn = (e: MouseEvent<HTMLButtonElement>) => {
        let id;
        const wrapper = e.currentTarget.closest(".postWrapper");
        if (wrapper) {
            const article = wrapper.querySelector("article");
            if (article) {
                id = article.id;
                setPostId(id);
            }
        }
        setPopup(true);
    };

    const handleEditBtn = (e: MouseEvent<HTMLButtonElement>) => {
        let id;
        const wrapper = e.currentTarget.closest(".postWrapper");
        if (wrapper) {
            const article = wrapper.querySelector("article");
            if (article) {
                id = article.id;
                setPostId(id);
            }
        }
        navigate(`${Paths.EDIT_POST}/${id}`);
    };

    const handlePopupCancelBtn = () => {
        setPopup(false);
        setPostId("");
    };

    const handlePopupRemoveBtn = async (e: MouseEvent<HTMLButtonElement>) => {
        try {
            if (postId) {
                await dispatch(removePost(postId));
                await setPopup(false);
                navigate(Paths.ACCOUNT);
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message);
        }
    };

    return (
        <>
            {loading && <Loading/>}
            {error && toast.error(status, {theme: "colored"})}
            {isAuth && (
                <div className={"flex flex-col gap-3"}>
                    {!posts?.length && (
                        <div className={"text-center text-lg"}>
                            У вас нет постов.
                            <Link
                                className="text-lg text-indigo-600 ml-3"
                                to={Paths.NEW_POST}
                            >
                                Добавьте пост
                            </Link>
                        </div>
                    )}
                    {posts &&
                        posts.map((post) => {
                            return post ? (
                                <MyPostsItem
                                    key={nanoid()}
                                    editBtnHandler={handleEditBtn}
                                    removeBtnHandler={handleRemoveBtn}
                                    post={post}
                                />
                            ) : null;
                        })}
                </div>
            )}
            <Popup
                btnActionSuccessColor={false}
                text={"Вы уверены что хотите удалить пост?"}
                state={popup}
                btnCancelHandler={handlePopupCancelBtn}
                btnActionHandler={handlePopupRemoveBtn}
            />
        </>
    );
};